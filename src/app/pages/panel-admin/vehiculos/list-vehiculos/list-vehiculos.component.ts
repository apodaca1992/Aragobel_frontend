import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; 
import { VehiculoService } from '@services/vehiculo.service'; // 👈 Tu servicio real de vehículos
import { PreferencesService } from '@services/preference.service';
import { AlertService } from '@services/alert.service';
import { IonInfiniteScroll } from '@ionic/angular';

@Component({
  selector: 'app-list-vehiculos',
  templateUrl: './list-vehiculos.component.html',
  styleUrls: ['./list-vehiculos.component.scss'],
})
export class ListVehiculosComponent implements OnInit {

  // Referencia nativa al componente de Scroll Infinito del HTML
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  // Modelo de filtros para la búsqueda en la API con activo = 1 por defecto
  filtros: any = {
    busqueda: '', // Buscará por placa o marca
    activo: 1 
  };

  // Variables de control de Paginación Móvil Nativa (Firestore Cursores)
  limite: number = 10;                // Cantidad fija de documentos por lote
  lastDocId: string | null = null;    // ⚡ Guarda el puntero ID del último registro consultado
  completado: boolean = false;         // Bandera que frena el scroll si ya no hay más datos

  // Arreglo que renderiza los vehículos obtenidos del servidor
  vehiculosFiltrados: any[] = [];

  // Variables de control de usuario y permisos
  idTiendaUsuarioActual: string = '';
  puedeCrear: boolean = false;
  esAdmin: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute, 
    private _vehiculoService: VehiculoService,
    private _preferencesService: PreferencesService,
    private _alertService: AlertService
  ) { }

  async ngOnInit() {
    // Carga de permisos y datos de usuario desde Preferences
    this.puedeCrear = await this._preferencesService.tienePermiso('VEHICULOS', 'CREAR');
    this.esAdmin = await this._preferencesService.esAdmin();
    
    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.idTiendaUsuarioActual = user.id_tienda;
    }
  }

  // Ciclo de vida de Ionic: Se dispara siempre al entrar o regresar a la pantalla
  async ionViewWillEnter() {
    console.log('Cargando catálogo de vehículos...');
    
    // Seguro de lectura por si el ngOnInit sigue en proceso
    if (!this.idTiendaUsuarioActual) {
      const userStr = await this._preferencesService.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.idTiendaUsuarioActual = user.id_tienda;
      }
    }

    // Carga inicial (limpiamos estados de punteros previos por seguridad)
    this.lastDocId = null;
    this.completado = false;
    if (this.infiniteScroll) this.infiniteScroll.disabled = false;
    
    this.cargarDatos();
  }

  // Petición HTTP GET al Servicio de Vehículos aplicando el cursor nativo de Firestore
  async cargarDatos(event?: any) {
    if (!this.idTiendaUsuarioActual) {
      console.warn('Esperando id_tienda válido...');
      if (event) event.target.complete();
      return;
    }

    // Inicializamos parámetros mapeando directo a la estructura de tu backend findAll
    const parametros: any = {
      activo: this.filtros.activo,
      id_tienda: this.idTiendaUsuarioActual,
      limit: this.limite
    };

    // ⚡ Si ya existe un puntero de la carga previa, lo adjuntamos a la petición
    if (this.lastDocId) {
      parametros.lastDocId = this.lastDocId;
    }

    // Aplicamos el truco NoSQL si el usuario escribió en el buscador (ej: placa o marca indexada)
    if (this.filtros.busqueda && this.filtros.busqueda.trim() !== '') {
      const textoBusqueda = this.filtros.busqueda.toLowerCase().trim();
      // Asumiendo que guardas un campo unificado o por placas, modificamos el sufijo NoSQL
      parametros.placas_search_gte = textoBusqueda;
      parametros.placas_search_lte = textoBusqueda + '\uf8ff';
    }

    this._vehiculoService.get(parametros).subscribe({
      next: (res: any) => {
        const nuevosDatos = Array.isArray(res) ? res : (res.data || []);
        
        // Si lastDocId es null significa que es la primera página o un reset de filtros limpio
        if (!this.lastDocId) {
          this.vehiculosFiltrados = nuevosDatos;
        } else {
          // Si ya hay un puntero, concatenamos el nuevo lote de datos al listado actual
          this.vehiculosFiltrados = [...this.vehiculosFiltrados, ...nuevosDatos];
        }

        // ⚡ REGISTRO DE CURSOR: Extraemos el ID del último elemento de este bloque para la siguiente consulta
        if (nuevosDatos.length > 0) {
          const ultimoElemento = nuevosDatos[nuevosDatos.length - 1];
          this.lastDocId = ultimoElemento.id;
          console.log(`Nuevo cursor registrado (lastDocId): ${this.lastDocId}`);
        }

        // Si el servidor regresó menos datos que nuestro límite, vaciamos el pipeline
        if (nuevosDatos.length < this.limite) {
          this.completado = true;
          if (this.infiniteScroll) this.infiniteScroll.disabled = true;
        }

        // Apaga la animación visual de carga del infinite scroll
        if (event) {
          event.target.complete();
        }
      },
      error: (err) => {
        if (!this.lastDocId) this.vehiculosFiltrados = [];
        if (event) event.target.complete();
        console.error('Error al consultar el catálogo de vehículos:', err);
      }
    });
  }

  // Se ejecuta automáticamente en cada scroll profundo de pantalla
  cargarMasVehiculos(event: any) {
    if (this.completado) {
      event.target.disabled = true;
      return;
    }
    this.cargarDatos(event);
  }

  // Verifica si existen registros para alternar el Empty State en el HTML
  hasVehiculos(): boolean {
    return this.vehiculosFiltrados && this.vehiculosFiltrados.length > 0;
  }

  // Este método se ejecuta únicamente al dar click en el botón azul "BUSCAR VEHÍCULO" desde el modal
  aplicarFiltros() {
    this.lastDocId = null;
    this.completado = false;
    if (this.infiniteScroll) this.infiniteScroll.disabled = false;
    
    this.cargarDatos();
  }

  // Navegación relativa hacia la pantalla del formulario en modo edición
  editVehiculo(vehiculo: any) {
    console.log('Enviando vehículo a edición:', vehiculo);
    this.router.navigate(['editar', vehiculo.id], {
      relativeTo: this.route,
      state: { vehiculo: vehiculo } // Pasamos el objeto completo para no re-consultar
    });
  }

  // Alerta de confirmación de eliminación
  async deleteVehiculo(vehiculo: any) {
    await this._alertService.confirm(
      '¿Eliminar Vehículo?',
      `¿Estás seguro de que deseas eliminar el vehículo con placas "${vehiculo.placas || vehiculo.id}"?`,
      () => {
        this.ejecutarEliminacion(vehiculo.id);
      }
    );
  }

  private ejecutarEliminacion(idVehiculo: number | string) {
    this._vehiculoService.delete(idVehiculo).subscribe({
      next: () => {
        console.log('Vehículo eliminado de forma lógica.');
        this.aplicarFiltros(); 
      },
      error: (err) => {
        console.error('Error al intentar eliminar el vehículo:', err);
      }
    });
  }

  // Pide confirmación y manda a reactivar
  async reactivarVehiculo(vehiculo: any) {
    await this._alertService.confirm(
      '¿Reactivar Vehículo?',
      `¿Deseas dar de alta nuevamente el vehículo "${vehiculo.marca} ${vehiculo.modelo}"?`,
      () => {
        const vehiculoActualizado = { 
          ...vehiculo, 
          activo: 1,
          deletedAt: null 
        };
        
        this._vehiculoService.put(vehiculoActualizado).subscribe({
          next: () => {
            console.log('Vehículo reactivado con éxito.');
            this.aplicarFiltros(); 
          },
          error: (err) => {
            console.error('Error al intentar reactivar el vehículo:', err);
          }
        });
      }
    );
  }
}