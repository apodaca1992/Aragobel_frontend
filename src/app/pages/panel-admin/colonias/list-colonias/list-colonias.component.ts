import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; 
import { ColoniaService } from '@services/colonia.service'; 
import { PreferencesService } from '@services/preference.service';
import { AlertService } from '@services/alert.service';
import { IonInfiniteScroll } from '@ionic/angular';

@Component({
  selector: 'app-list-colonias',
  templateUrl: './list-colonias.component.html',
  styleUrls: ['./list-colonias.component.scss'],
})
export class ListColoniasComponent implements OnInit {

  // Referencia nativa al componente de Scroll Infinito del HTML
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  // Modelo de filtros para la búsqueda en la API con activo = 1 por defecto
  filtros: any = {
    nombre: '',
    activo: 1 
  };

  // Variables de control de Paginación Móvil Nativa (Firestore Cursores)
  limite: number = 10;                // Cantidad fija de documentos por lote
  lastDocId: string | null = null;    // ⚡ Guarda el puntero ID del último registro consultado
  completado: boolean = false;         // Bandera que frena el scroll si ya no hay más datos

  // Arreglo que renderiza las colonias obtenidas del servidor
  coloniasFiltradas: any[] = [];

  // Variables de control de usuario y permisos
  idTiendaUsuarioActual: string = '';
  puedeCrear: boolean = false;
  esAdmin: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute, 
    private _coloniasService: ColoniaService,
    private _preferencesService: PreferencesService,
    private _alertService: AlertService
  ) { }

  async ngOnInit() {
    // Carga de permisos y datos de usuario desde Preferences
    this.puedeCrear = await this._preferencesService.tienePermiso('COLONIAS', 'CREAR');
    this.esAdmin = await this._preferencesService.esAdmin();
    
    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.idTiendaUsuarioActual = user.id_tienda;
    }
  }

  // Ciclo de vida de Ionic: Se dispara siempre al entrar o regresar a la pantalla
  async ionViewWillEnter() {
    console.log('Cargando catálogo de colonias...');
    
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

  // Petición HTTP GET al Servicio de Colonias aplicando el cursor nativo de Firestore
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

    // Aplicamos el truco NoSQL si el usuario escribió en el buscador
    if (this.filtros.nombre && this.filtros.nombre.trim() !== '') {
      const textoBusqueda = this.filtros.nombre.toLowerCase().trim();
      parametros.nombre_search_gte = textoBusqueda;
      parametros.nombre_search_lte = textoBusqueda + '\uf8ff';
    }

    this._coloniasService.get(parametros).subscribe({
      next: (res: any) => {
        const nuevosDatos = Array.isArray(res) ? res : (res.data || []);
        
        // Si lastDocId es null significa que es la primera página o un reset de filtros limpio
        if (!this.lastDocId) {
          this.coloniasFiltradas = nuevosDatos;
        } else {
          // Si ya hay un puntero, concatenamos el nuevo lote de datos al listado actual
          this.coloniasFiltradas = [...this.coloniasFiltradas, ...nuevosDatos];
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
        if (!this.lastDocId) this.coloniasFiltradas = [];
        if (event) event.target.complete();
        console.error('Error al consultar el catálogo de colonias:', err);
      }
    });
  }

  // Se ejecuta automáticamente en cada scroll profundo de pantalla
  cargarMasColonias(event: any) {
    if (this.completado) {
      event.target.disabled = true;
      return;
    }
    // Llama al método estándar; la existencia de 'this.lastDocId' mandará el cursor en automático
    this.cargarDatos(event);
  }

  // Verifica si existen registros para alternar el Empty State en el HTML
  hasColonias(): boolean {
    return this.coloniasFiltradas && this.coloniasFiltradas.length > 0;
  }

  // Este método se ejecuta únicamente al dar click en el botón azul "BUSCAR COLONIA"
  aplicarFiltros() {
    // Reseteamos por completo el puntero e infinite scroll para arrancar una búsqueda limpia
    this.lastDocId = null;
    this.completado = false;
    if (this.infiniteScroll) this.infiniteScroll.disabled = false;
    
    this.cargarDatos();
  }

  // Navegación relativa hacia la pantalla del formulario en modo edición
  editColonia(colonia: any) {
    console.log('Enviando colonia a edición:', colonia);
    this.router.navigate(['nuevo'], {
      relativeTo: this.route,
      state: { colonia: colonia }
    });
  }

  // Alerta de confirmación de eliminación
  async deleteColonia(colonia: any) {
    await this._alertService.confirm(
      '¿Eliminar Colonia?',
      `¿Estás seguro de que deseas eliminar la colonia "${colonia.nombre}" del catálogo?`,
      () => {
        this.ejecutarEliminacion(colonia.id);
      }
    );
  }

  // Envía la actualización a la API (Baja lógica o DELETE)
  private ejecutarEliminacion(idColonia: number | string) {
    this._coloniasService.delete(idColonia).subscribe({
      next: () => {
        console.log('Colonia eliminada.');
        this.aplicarFiltros(); 
      },
      error: (err) => {
        console.error('Error al intentar eliminar la colonia:', err);
      }
    });
  }

  // Pide confirmación y manda a reactivar limpiando deletedAt en null
  async reactivarColonia(colonia: any) {
    await this._alertService.confirm(
      '¿Reactivar Colonia?',
      `¿Deseas dar de alta nuevamente la colonia "${colonia.nombre}" en el catálogo activo?`,
      () => {
        const coloniaActualizada = { 
          ...colonia, 
          activo: 1,
          deletedAt: null 
        };
        
        this._coloniasService.put(coloniaActualizada).subscribe({
          next: () => {
            console.log('Colonia reactivada con éxito.');
            this.aplicarFiltros(); 
          },
          error: (err) => {
            console.error('Error al intentar reactivar la colonia:', err);
          }
        });
      }
    );
  }
}