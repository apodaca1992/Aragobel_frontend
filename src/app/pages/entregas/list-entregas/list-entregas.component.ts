import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EntregaService } from '@services/entrega.service'; 
import { VehiculoService } from '@services/vehiculo.service'; 
import { EntregaInterface } from '@interfaces/entrega-interface';
import { VehiculoInterface } from '@interfaces/vehiculo-interface';
import { PreferencesService } from '@services/preference.service';
import { AlertService } from '@services/alert.service';
import { ActionSheetService } from '@services/action-sheet.service';
import { GeolocationService } from '@services/geolocation.service';
import { IonInfiniteScroll } from '@ionic/angular';

interface EstadoPestana {
  datos: EntregaInterface[];
  lastDocId: string | null;
  completado: boolean;
}

@Component({
  selector: 'app-list-entregas',
  templateUrl: './list-entregas.component.html',
  styleUrls: ['./list-entregas.component.scss'],
})
export class ListEntregasComponent implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  segmentoActual: string = 'disponibles';
  cargando: boolean = false;
  limite: number = 10;
  
  // Bandera de control para asegurar que las lecturas del Storage terminaron
  usuarioInicializado: boolean = false;

  // Diccionario contenedor con estados independientes por pestaña
  listasPorSegmento: { [key: string]: EstadoPestana } = {
    'mis-registros': { datos: [], lastDocId: null, completado: false },
    'disponibles':   { datos: [], lastDocId: null, completado: false },
    'camino':        { datos: [], lastDocId: null, completado: false }
  };

  idUsuarioActual: string = '';
  idTiendaUsuarioActual: string = '';
  nombreUsuario: string = '';
  puedeCrear: boolean = false; 
  esCajero: boolean = false;
  esAdmin: boolean = false;

  constructor(
    private router: Router,
    private _alertService: AlertService,
    private _preferencesService: PreferencesService,
    private _entregaService: EntregaService,
    private _vehiculoService: VehiculoService,
    private _actionSheetService: ActionSheetService,
    private _geoService: GeolocationService
  ) {}

  async ngOnInit() {
    await this.cargarConfiguracionUsuario();
  }

  // Carga y asignación secuencial estricta de la sesión
  async cargarConfiguracionUsuario(): Promise<void> {
    this.puedeCrear = await this._preferencesService.tienePermiso('ENTREGAS', 'CREAR');
    this.esAdmin = await this._preferencesService.esAdmin(); 
    this.idUsuarioActual = await this._preferencesService.getIdUser();
    
    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        this.idTiendaUsuarioActual = user.id_tienda; 
        this.nombreUsuario = user.nombre + ' ' + user.apellido_paterno + ' ' + user.apellido_materno;
    }
    
    this.esCajero = this.puedeCrear;
    
    if (this.puedeCrear && !this.esAdmin) { 
      this.esCajero = true;
      this.segmentoActual = 'mis-registros';
    } else {
      this.esCajero = false;
      this.segmentoActual = 'disponibles';
    }

    this.usuarioInicializado = true;
  }

  // Ciclo de vida nativo de Ionic (Garantiza ejecución al entrar o regresar)
  async ionViewWillEnter() {
    console.log('Entrando al módulo de entregas...');
    
    // ⚡ SOLUCIÓN AL ERROR EN CELULAR FÍSICO:
    // Si la lectura asíncrona del teléfono va lenta y las variables críticas están vacías,
    // frenamos el hilo y obligamos a esperar a que PreferencesService responda por completo.
    if (!this.usuarioInicializado || !this.idTiendaUsuarioActual || !this.idUsuarioActual) {
      console.log('Almacenamiento asíncrono retrasado. Forzando espera en dispositivo físico...');
      await this.cargarConfiguracionUsuario();
    }

    // Una vez resuelto el rol real (Cajero), reseteamos los cursores del paginado y descargamos
    this.reiniciarTodoElPaginador();
    this.cargarDatos();
  }

  cambiarSegmento() {
    if (!this.usuarioInicializado) return;

    const estado = this.listasPorSegmento[this.segmentoActual];
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = estado.completado;
    }

    if (estado.datos.length === 0 && !estado.completado) {
      this.cargarDatos();
    }
  }

  private reiniciarTodoElPaginador() {
    Object.keys(this.listasPorSegmento).forEach(key => {
      this.listasPorSegmento[key] = { datos: [], lastDocId: null, completado: false };
    });
    if (this.infiniteScroll) this.infiniteScroll.disabled = false;
  }

  private reiniciarPestanaEspecifica(segmento: string) {
    this.listasPorSegmento[segmento] = { datos: [], lastDocId: null, completado: false };
    if (this.segmentoActual === segmento && this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
  }

  async cargarDatos(event?: any) {
    // Protección final de nulos para la API
    if (!this.idTiendaUsuarioActual || !this.usuarioInicializado) {
      if (event) event.target.complete();
      return;
    }

    const estadoActual = this.listasPorSegmento[this.segmentoActual];

    if (!estadoActual.lastDocId) {
      this.cargando = true;
    }

    // ⚡ HOMOLOGACIÓN DE FECHA: Estructurada idéntica a la inserción del formulario para que NoSQL la encuentre
    const filtros: any = {
      activo: 1,
      id_tienda: this.idTiendaUsuarioActual,
      fecha_venta: `TODAY|${this.idTiendaUsuarioActual}`, 
      limit: this.limite
    };

    if (estadoActual.lastDocId) {
      filtros.lastDocId = estadoActual.lastDocId;
    }

    // Ahora 'this.esCajero' tiene el valor real correcto desde la primera carga
    if (this.esCajero) {
      filtros.id_usuario_creador = this.idUsuarioActual;
      filtros.estatus = '!=|3'; 
    } else {
      if (this.segmentoActual === 'disponibles') {
        filtros.estatus = 1; 
      } else if (this.segmentoActual === 'camino') {
        filtros.estatus = 2; 
        if (!this.esAdmin) {
          filtros.id_repartidor = this.idUsuarioActual; 
        }
      }
    }

    this._entregaService.get(filtros).subscribe({
      next: (res: any) => {
        const nuevosDatos = Array.isArray(res) ? res : (res.data || []);
        
        if (!estadoActual.lastDocId) {
          estadoActual.datos = nuevosDatos;
        } else {
          estadoActual.datos = [...estadoActual.datos, ...nuevosDatos];
        }

        if (nuevosDatos.length > 0) {
          const ultimoElemento = nuevosDatos[nuevosDatos.length - 1];
          estadoActual.lastDocId = ultimoElemento.id;
        }

        if (nuevosDatos.length < this.limite) {
          estadoActual.completado = true;
          if (this.infiniteScroll) this.infiniteScroll.disabled = true;
        }

        if (event) event.target.complete();
        this.cargando = false;
      },
      error: (err) => {
        if (!estadoActual.lastDocId) estadoActual.datos = [];
        if (event) event.target.complete();
        this.cargando = false;
        console.error('Error al consultar entregas:', err);
      }
    });
  }

  cargarMasEntregas(event: any) {
    const estadoActual = this.listasPorSegmento[this.segmentoActual];
    if (estadoActual.completado) {
      event.target.disabled = true;
      return;
    }
    this.cargarDatos(event);
  }

  get entregasPorPestana(): EntregaInterface[] {
    return this.listasPorSegmento[this.segmentoActual]?.datos || [];
  }

  hasEntregas(): boolean {
    return this.entregasPorPestana.length > 0;
  }

  // --- Operaciones nativas del flujo de Repartidores/Cajeros ---

  async abrirSelectorVehiculo(entrega: any) {
    this._vehiculoService.get({ activo: 1, id_tienda: this.idTiendaUsuarioActual }).subscribe({
      next: async (res: any) => {
        const vehiculos = Array.isArray(res) ? res : (res.data || []);        
        const opciones = vehiculos.map((v: VehiculoInterface) => ({
          text: v.nombre,
          icon: v.tipo === 'moto' ? 'bicycle-outline' : (v.tipo === 'camioneta' ? 'car-outline' : 'walk-outline'),
          value: { id: v.id, nombre: v.nombre }
        }));

        const seleccion = await this._actionSheetService.show<{ id: string, nombre: string }>(
          '¿En qué vehículo sales?', 
          opciones,
          'Selecciona una unidad para el folio: ' + entrega.folio
        );

        if (seleccion) {
          this.asignarEntrega(entrega.id, seleccion.id, seleccion.nombre);
        }
      }
    });
  }

  async asignarEntrega(idEntrega: number | string, idVehiculo: string, nombreVehiculo: string) {
    const coords = await this._geoService.getPosition();
    if (!coords) return;

    const datosActualizar: any = {
      id: idEntrega,
      id_repartidor: this.idUsuarioActual,
      nombre_repartidor: this.nombreUsuario,
      id_vehiculo: idVehiculo,
      nombre_vehiculo: nombreVehiculo,
      estatus: 2,
      ubicacion: { lat: coords.latitude, lng: coords.longitude }
    };

    this._entregaService.put(datosActualizar).subscribe({
      next: () => {
        this.reiniciarPestanaEspecifica('disponibles');
        this.reiniciarPestanaEspecifica('camino');
        this.cargarDatos(); 
      },
      error: (err) => console.error(err)
    });
  }

  async finalizarEntrega(idEntrega: number | string) {
    const coords = await this._geoService.getPosition();
    if (!coords) return;

    const datosActualizar: any = {
      id: idEntrega,
      estatus: 3,
      ubicacion: { lat: coords.latitude, lng: coords.longitude }
    };

    this._entregaService.put(datosActualizar).subscribe({
      next: () => {
        this.reiniciarPestanaEspecifica('camino');
        this.cargarDatos(); 
      },
      error: (err) => console.error(err)
    });
  }

  nuevaEntrega() {
    this.router.navigate(['/entregas/form-entregas']);
  }

  editarEntrega(entrega: any) {
    if (entrega.estatus === 3) return;
    this.router.navigate(['/entregas/form-entregas'], {
      state: { entrega: entrega }
    });
  }

  async marcarComoEntregado(entrega: any) {
    await this._alertService.confirm(
      '¿Finalizar Entrega?',
      `¿Confirmas que el folio ${entrega.folio} ha sido entregado?`,
      () => {
        this.finalizarEntrega(entrega.id);
      }
    );
  }
}