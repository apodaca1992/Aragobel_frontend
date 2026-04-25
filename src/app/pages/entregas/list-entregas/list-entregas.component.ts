import { Component, effect, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpHelper } from '../../../class/http-helper';
import { EntregaService } from '@services/entrega.service'; // Asegura que la ruta sea correcta
import { EntregaInterface } from '@interfaces/entrega-interface';
import { PreferencesService } from '@services/preference.service';
import { AlertService } from '@services/alert.service';
import { ActionSheetService } from '@services/action-sheet.service';

@Component({
  selector: 'app-list-entregas',
  templateUrl: './list-entregas.component.html',
  styleUrls: ['./list-entregas.component.scss'],
})
export class ListEntregasComponent  implements OnInit {
  segmentoActual: string = 'disponibles';
  todasLasEntregas: EntregaInterface[] = []; // Aquí llenas con tu API
 
  idUsuarioActual: string = '';
  idTiendaUsuarioActual: string = '';
  puedeCrear: boolean = false; // Variable booleana para la vista
  esCajero: boolean = false;
  esAdmin: boolean = false;

  constructor(
    private router: Router,
    private _alertService: AlertService,
    private _preferencesService: PreferencesService,
    private _entregaService: EntregaService,
    private _actionSheetService: ActionSheetService,
  ) {}

  async ngOnInit() {
    this.puedeCrear = await this._preferencesService.tienePermiso('ENTREGAS', 'CREAR');
    this.esAdmin = await this._preferencesService.esAdmin(); // O tu lógica de rol
    this.idUsuarioActual = await this._preferencesService.getIdUser();
    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        this.idTiendaUsuarioActual = user.id_tienda; // O la propiedad que necesites
    }
    this.esCajero = this.puedeCrear;
    // 3. Definimos qué pestaña mostrar por defecto al entrar
    if (this.puedeCrear && !this.esAdmin) { //!this.esAdmin
      this.esCajero = true;
      this.segmentoActual = 'mis-registros';
    } else {
      this.esCajero = false;
      this.segmentoActual = 'disponibles';
    }
    this.cargarDatos();
  }

  // Se dispara cada vez que entras a la vista, incluso al regresar del formulario
  async ionViewWillEnter() {
    console.log('La vista va a entrar, refrescando datos...');
    this.cargarDatos();
  }

  async cargarDatos() {
    // Aquí llamarías a tu servicio: this.entregaService.getEntregas().subscribe(...)
    // Ejemplo de datos basado en tu tabla SQL:
    const filtros = {
      activo: 1,
      id_tienda: this.idTiendaUsuarioActual,
      fecha_venta: HttpHelper.getFechaLocal(),
      estatus: '!=|3'
    };

    // Llamamos al servicio GET que definimos anteriormente
    this._entregaService.get(filtros).subscribe({
      next: (res:any) => {
        this.todasLasEntregas = res.data;
        console.log('Datos cargados:', res.data);
      },
      error: (err) => {
        this.todasLasEntregas = [];
        console.error('Error al cargar entregas', err);
      }
    });
  
  }

  // El "motor" de las pestañas
  get entregasFiltradas() {

    if (!Array.isArray(this.todasLasEntregas)) {
      return [];
    }
    
    if (this.esCajero) {
      return this.todasLasEntregas.filter(e => e.id_usuario_creador === this.idUsuarioActual);
    }


    if (this.segmentoActual === 'disponibles') {
      return this.todasLasEntregas.filter(e => e.estatus === 1);
    } else {
      if (this.esAdmin) {
        return this.todasLasEntregas.filter(e => e.estatus === 2);
      }
      return this.todasLasEntregas.filter(e => e.estatus === 2 && e.id_repartidor === this.idUsuarioActual);
    }
  }

  async abrirSelectorVehiculo(entrega: any) {
    // DATOS ESTÁTICOS (Simulando lo que vendría de la DB)
    const vehiculosEstaticos = [
      { id: 'V-001', nombre: 'Moto Italika 150', tipo: 'moto' },
      { id: 'V-002', nombre: 'Camioneta Ford', tipo: 'camioneta' },
      { id: 'V-003', nombre: 'Bicicleta Eléctrica', tipo: 'bici' }
    ];

    // Mapeamos al formato que pide nuestro servicio
    const opciones = vehiculosEstaticos.map(v => ({
      text: v.nombre,
      icon: v.tipo === 'moto' ? 'bicycle-outline' : (v.tipo === 'camioneta' ? 'car-outline' : 'walk-outline'),
      value: v.id
    }));

    // Invocamos el Action Sheet y esperamos la respuesta
    const idVehiculo = await this._actionSheetService.show(
      '¿En qué vehículo sales?', 
      opciones,
      'Selecciona una unidad para el folio: ' + entrega.folio
    );

    // Si seleccionó algo (y no dio clic en cancelar)
    if (idVehiculo) {
      this.asignarEntrega(entrega.id, idVehiculo);
    }

  }

  async asignarEntrega(idEntrega: number | string, idVehiculo: number | string) {
    // Creamos el objeto para actualizar (Estatus 2 = En tránsito)
    const datosActualizar: any = {
      id: idEntrega,
      id_repartidor: this.idUsuarioActual,
      id_vehiculo: idVehiculo,
      estatus: 2 
    };

    this._entregaService.put(datosActualizar).subscribe({
      next: () => {
        this.cargarDatos(); // Refrescamos la lista
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  async finalizarEntrega(idEntrega: number | string) {
    // Creamos el objeto para actualizar (Estatus 2 = En tránsito)
    const datosActualizar: any = {
      id: idEntrega,
      estatus: 3
    };

    this._entregaService.put(datosActualizar).subscribe({
      next: () => {
        this.cargarDatos(); // Refrescamos la lista
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  nuevaEntrega() {
    this.router.navigate(['/entregas/form-entregas']);
  }

  editarEntrega(entrega: any) {
    if (entrega.estatus === 3) {
      // Opcional: mostrar un toast avisando que ya no se puede editar
      return;
    }
  
    this.router.navigate(['/entregas/form-entregas'], {
      state: { entrega: entrega }
    });
  }

  async marcarComoEntregado(entrega: any) {
    // Usamos el servicio centralizado
    await this._alertService.confirm(
      '¿Finalizar Entrega?',
      `¿Confirmas que el folio ${entrega.folio} ha sido entregado?`,
      () => {
        // Esta es la función que se ejecuta si el usuario da clic en "Aceptar"
        this.finalizarEntrega(entrega.id);
      }
    );
  }
}
