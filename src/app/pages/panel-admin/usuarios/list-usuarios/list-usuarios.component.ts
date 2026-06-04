import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; 
import { UsuarioService } from '@services/usuario.service'; 
import { PreferencesService } from '@services/preference.service';
import { AlertService } from '@services/alert.service';
// CORRECCIÓN: Se agrega IonModal a las importaciones de Ionic
import { IonInfiniteScroll, IonModal } from '@ionic/angular';

@Component({
  selector: 'app-list-usuarios',
  templateUrl: './list-usuarios.component.html',
  styleUrls: ['./list-usuarios.component.scss'],
})
export class ListUsuariosComponent implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  
  // CORRECCIÓN DEFINITIVA: Vinculamos la referencia #filterModal del HTML al controlador TS
  @ViewChild('filterModal') filterModal!: IonModal;

  filtros: any = {
    busqueda: '', 
    activo: 1 
  };

  limite: number = 10;                
  lastDocId: string | null = null;    
  completado: boolean = false;         

  usuariosFiltrados: any[] = [];

  idTiendaUsuarioActual: string = '';
  puedeCrear: boolean = false;
  esAdmin: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute, 
    private _usuarioService: UsuarioService,
    private _preferencesService: PreferencesService,
    private _alertService: AlertService
  ) { }

  async ngOnInit() {
    this.puedeCrear = await this._preferencesService.tienePermiso('USUARIOS', 'CREAR');
    this.esAdmin = await this._preferencesService.esAdmin();
    
    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.idTiendaUsuarioActual = user.id_tienda;
    }
  }

  async ionViewWillEnter() {
    console.log('Cargando catálogo de usuarios...');
    
    if (!this.idTiendaUsuarioActual) {
      const userStr = await this._preferencesService.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.idTiendaUsuarioActual = user.id_tienda;
      }
    }

    this.lastDocId = null;
    this.completado = false;
    if (this.infiniteScroll) this.infiniteScroll.disabled = false;
    
    this.cargarDatos();
  }

  // CORRECCIÓN: Método limpio para controlar la apertura manual desde el botón
  abrirFiltros() {
    if (this.filterModal) {
      this.filterModal.present();
    }
  }

  async cargarDatos(event?: any) {
    if (!this.idTiendaUsuarioActual) {
      if (event) event.target.complete();
      return;
    }

    const parametros: any = {
      activo: this.filtros.activo,
      tiendas_ids: "array-contains|" + this.idTiendaUsuarioActual,
      limit: this.limite
    };

    if (this.lastDocId) {
      parametros.lastDocId = this.lastDocId;
    }

    if (this.filtros.busqueda && this.filtros.busqueda.trim() !== '') {
      const textoBusqueda = this.filtros.busqueda.toLowerCase().trim();
      parametros.nombre_search_gte = textoBusqueda;
      parametros.nombre_search_lte = textoBusqueda + '\uf8ff';
    }

    this._usuarioService.get(parametros).subscribe({
      next: (res: any) => {
        const nuevosDatos = Array.isArray(res) ? res : (res.data || []);
        
        if (!this.lastDocId) {
          this.usuariosFiltrados = nuevosDatos;
        } else {
          this.usuariosFiltrados = [...this.usuariosFiltrados, ...nuevosDatos];
        }

        if (nuevosDatos.length > 0) {
          const ultimoElemento = nuevosDatos[nuevosDatos.length - 1];
          this.lastDocId = ultimoElemento.id;
        }

        if (nuevosDatos.length < this.limite) {
          this.completado = true;
          if (this.infiniteScroll) this.infiniteScroll.disabled = true;
        }

        if (event) event.target.complete();
      },
      error: (err) => {
        if (!this.lastDocId) this.usuariosFiltrados = [];
        if (event) event.target.complete();
        console.error('Error al consultar el catálogo de usuarios:', err);
      }
    });
  }

  cargarMasUsuarios(event: any) {
    if (this.completado) {
      event.target.disabled = true;
      return;
    }
    this.cargarDatos(event);
  }

  hasUsuarios(): boolean {
    return this.usuariosFiltrados && this.usuariosFiltrados.length > 0;
  }

  aplicarFiltros() {
    this.lastDocId = null;
    this.completado = false;
    if (this.infiniteScroll) this.infiniteScroll.disabled = false;
    
    this.cargarDatos();
  }

  obtenerIniciales(nombre: string, apellido: string): string {
    const initNombre = nombre ? nombre.slice(0, 1) : 'U';
    const initApellido = apellido ? apellido.slice(0, 1) : 'S';
    return (initNombre + initApellido).toUpperCase();
  }

  editUsuario(usuario: any) {
    this.router.navigate(['editar', usuario.id], {
      relativeTo: this.route,
      state: { usuario: usuario }
    });
  }

  async deleteUsuario(usuario: any) {
    await this._alertService.confirm(
      '¿Desactivar Usuario?',
      `¿Estás seguro de que deseas desactivar al usuario "${usuario.nombre || usuario.id}"?`,
      () => {
        this.ejecutarEliminacion(usuario.id);
      }
    );
  }

  private ejecutarEliminacion(idUsuario: number | string) {
    this._usuarioService.delete(idUsuario).subscribe({
      next: () => {
        this.aplicarFiltros(); 
      },
      error: (err) => {
        console.error('Error al intentar eliminar el usuario:', err);
      }
    });
  }

  async reactivarUsuario(usuario: any) {
    await this._alertService.confirm(
      '¿Reactivar Usuario?',
      `¿Deseas dar de alta nuevamente al usuario "${usuario.nombre}"?`,
      () => {
        const usuarioActualizado = { 
          ...usuario, 
          activo: 1,
          deletedAt: null 
        };
        
        this._usuarioService.put(usuarioActualizado).subscribe({
          next: () => {
            this.aplicarFiltros(); 
          },
          error: (err) => {
            console.error('Error al intentar reactivar el usuario:', err);
          }
        });
      }
    );
  }
}