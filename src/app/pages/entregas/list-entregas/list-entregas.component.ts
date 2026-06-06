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

// Definimos una interfaz para el estado de cada pestaña de forma aislada
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

  // ⚡ EL SECRETO: Diccionario contenedor con estados independientes por pestaña
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
  }

  async ionViewWillEnter() {
    if (!this.idTiendaUsuarioActual) {
      const userStr = await this._preferencesService.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.idTiendaUsuarioActual = user.id_tienda;
      }
    }

    // Al entrar a la vista limpiamos por completo todas las pestañas para traer datos frescos
    this.reiniciarTodoElPaginador();
    this.cargarDatos();
  }

  // Al cambiar de pestaña, evaluamos si ya tiene datos previos o si requiere consulta inicial
  cambiarSegmento() {
    const estado = this.listasPorSegmento[this.segmentoActual];
    
    // Controlamos el estado del componente Infinite Scroll nativo según la pestaña destino
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = estado.completado;
    }

    // Si la pestaña no tiene datos cargados, hacemos su primera petición
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

  // Re-utilizable para limpiar una sola pestaña tras una mutación (Tomar o Finalizar entrega)
  private reiniciarPestanaEspecifica(segmento: string) {
    this.listasPorSegmento[segmento] = { datos: [], lastDocId: null, completado: false };
    if (this.segmentoActual === segmento && this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
  }

  async cargarDatos(event?: any) {
    if (!this.idTiendaUsuarioActual) {
      if (event) event.target.complete();
      return;
    }

    // Obtenemos la referencia del estado de la pestaña que está viendo el usuario actualmente
    const estadoActual = this.listasPorSegmento[this.segmentoActual];

    // Si es la primera página del segmento, disparamos el loader visual
    if (!estadoActual.lastDocId) {
      this.cargando = true;
    }

    const filtros: any = {
      activo: 1,
      id_tienda: this.idTiendaUsuarioActual,
      fecha_venta: 'TODAY',
      limit: this.limite
    };

    // Aplicamos el cursor si y solo si pertenece al registro histórico de ESTE segmento
    if (estadoActual.lastDocId) {
      filtros.lastDocId = estadoActual.lastDocId;
    }

    // Aplicación de filtros dinámicos Server-Side
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

        // Registramos el cursor apuntando al último elemento del segmento actual
        if (nuevosDatos.length > 0) {
          const ultimoElemento = nuevosDatos[nuevosDatos.length - 1];
          estadoActual.lastDocId = ultimoElemento.id;
        }

        // Si regresan menos datos que el límite, marcamos la pestaña como completada
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
        console.error('Error al consultar entregas por segmento:', err);
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

  // Helper para mapear los datos correctos en el HTML de forma limpia
  get entregasPorPestana(): EntregaInterface[] {
    return this.listasPorSegmento[this.segmentoActual]?.datos || [];
  }

  hasEntregas(): boolean {
    return this.entregasPorPestana.length > 0;
  }

  // --- Operaciones de flujo de estatus ---

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
        // ⚡ OPTIMIZACIÓN REACTIVA: Cuando tomas una entrega, limpias ambas pestañas afectadas 
        // para forzar a que recalculen sus cursores e índices desde el servidor limpiamente.
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
        // Al finalizar, removemos el cache local de la pestaña "En Camino" para actualizar la lista
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