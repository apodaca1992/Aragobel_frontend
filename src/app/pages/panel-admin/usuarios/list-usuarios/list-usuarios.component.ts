import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; 
import { UsuarioService } from '@services/usuario.service'; 
import { PreferencesService } from '@services/preference.service';
import { AlertService } from '@services/alert.service';
import { IonInfiniteScroll, IonModal } from '@ionic/angular';

@Component({
  selector: 'app-list-usuarios',
  templateUrl: './list-usuarios.component.html',
  styleUrls: ['./list-usuarios.component.scss'],
})
export class ListUsuariosComponent implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  @ViewChild('filterModal') filterModal!: IonModal;

  filtros: any = {
    tipoBusqueda: 'nombre',
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

  abrirFiltros() {
    if (this.filterModal) {
      this.filterModal.present();
    }
  }

  // AGREGADO: Limpia el campo de texto cuando el usuario alterna el tipo de criterio
  limpiarBusqueda() {
    this.filtros.busqueda = '';
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
      
      if (this.filtros.tipoBusqueda === 'nombre') {
        parametros.nombre_completo_search_gte = textoBusqueda;
        parametros.nombre_completo_search_lte = textoBusqueda + '\uf8ff';
      } else {
        parametros.usuario_search_gte = textoBusqueda;
        parametros.usuario_search_lte = textoBusqueda + '\uf8ff';
      }
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

  obtenerIniciales(nombreCompleto: string, segundoParametro?: string): string {
    if (!nombreCompleto) return 'US';
    const partes = nombreCompleto.trim().split(' ');
    const primeraLetra = partes[0] ? partes[0].charAt(0) : 'U';
    const segundaLetra = partes[1] ? partes[1].charAt(0) : 'S'; 
    return (primeraLetra + segundaLetra).toUpperCase();
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