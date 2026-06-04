import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; 
import { ColoniaService } from '@services/colonia.service'; 
import { PreferencesService } from '@services/preference.service';
import { AlertService } from '@services/alert.service';

@Component({
  selector: 'app-list-colonias',
  templateUrl: './list-colonias.component.html',
  styleUrls: ['./list-colonias.component.scss'],
})
export class ListColoniasComponent implements OnInit {

  // Modelo de filtros para la búsqueda en la API
  filtros: any = {
    nombre: ''
  };

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

    // Carga inicial usando el valor actual del filtro (vacío al principio)
    this.cargarDatos();
  }

  // Petición HTTP GET al Servicio de Colonias haciendo el LIKE en el servidor
  // Petición HTTP GET al Servicio de Colonias aplicando el truco NoSQL (\uf8ff)
  async cargarDatos() {
    if (!this.idTiendaUsuarioActual) {
      console.warn('Esperando id_tienda válido...');
      return;
    }

    // Inicializamos los parámetros base obligatorios
    const parametros: any = {
      activo: 1,
      id_tienda: this.idTiendaUsuarioActual
    };

    // ⚡ Aplicamos el truco NoSQL si el usuario escribió en el buscador
    if (this.filtros.nombre && this.filtros.nombre.trim() !== '') {
      const textoBusqueda = this.filtros.nombre.trim();
      
      // En Firestore/NoSQL para hacer un "Abre con", se busca un rango:
      // Desde el texto original, hasta el texto original + el carácter Unicode más alto posible (\uf8ff)
      parametros.nombre_gte = textoBusqueda;
      parametros.nombre_lte = textoBusqueda + '\uf8ff';
    }

    this._coloniasService.get(parametros).subscribe({
      next: (res: any) => {
        // En este esquema, el servidor NoSQL ya nos regresa los datos filtrados desde la base de datos
        this.coloniasFiltradas = Array.isArray(res) ? res : (res.data || []);
        console.log('Colonias filtradas desde el servidor NoSQL:', this.coloniasFiltradas);
      },
      error: (err) => {
        this.coloniasFiltradas = [];
        console.error('Error al consultar el catálogo de colonias:', err);
      }
    });
  }

  // Verifica si existen registros para alternar el Empty State en el HTML
  hasColonias(): boolean {
    return this.coloniasFiltradas && this.coloniasFiltradas.length > 0;
  }

  // Este método se ejecuta únicamente al dar click en el botón azul "BUSCAR COLONIA"
  aplicarFiltros() {
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
        this.cargarDatos(); // Recarga la lista manteniendo el filtro activo actual
      },
      error: (err) => {
        console.error('Error al intentar eliminar la colonia:', err);
      }
    });
  }
}