import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '@services/usuario.service'; 
import { RolService } from '@services/rol.service'; 
import { PreferencesService } from '@services/preference.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-form-usuarios',
  templateUrl: './form-usuarios.component.html',
  styleUrls: ['./form-usuarios.component.scss'],
})
export class FormUsuariosComponent implements OnInit {

  usuario: any = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',       
    usuario: '',
    email: '',
    contrasena: '',            
    nombre_completo: '',        
    nombre_completo_search: '', 
    usuario_search: '',         
    activo: 1,
    tiendas_ids: [],            
    roles: [],
    permisos: {},
    tiendas_asignadas: [] 
  };

  esEdicion: boolean = false;
  mostrarPassword: boolean = false; 
  listaRoles: any[] = [];      

  constructor(
    private _usuarioService: UsuarioService,
    private _rolService: RolService,           
    private _preferencesService: PreferencesService,
    private _toastService: ToastService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.obtenerCatalogoRoles();

    const state = this.router.getCurrentNavigation()?.extras.state;
    
    if (state && state['usuario']) {
      this.usuario = { ...state['usuario'] };
      this.usuario.contrasena = ''; 
      
      if (!this.usuario.tiendas_ids) this.usuario.tiendas_ids = [];
      if (!this.usuario.roles) this.usuario.roles = [];
      if (!this.usuario.permisos) this.usuario.permisos = {};
      if (!this.usuario.tiendas_asignadas) this.usuario.tiendas_asignadas = [];
      
      if (this.usuario.tiendas_asignadas.length === 0 && this.usuario.tiendas_ids.length > 0) {
        this.inicializarTiendaActual(this.usuario.tiendas_ids[0], 'Tienda Actual');
      }
      
      this.esEdicion = true;
    } else {
      this.esEdicion = false;
      
      const userStr = await this._preferencesService.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.id_tienda) {
          const idTiendaDefecto = String(user.id_tienda);
          const nombreTiendaDefecto = user.nombre_tienda || 'Tienda Principal';
          
          this.inicializarTiendaActual(idTiendaDefecto, nombreTiendaDefecto);
        }
      }    
    }
  }

  inicializarTiendaActual(idTienda: string, nombreTienda: string) {
    this.usuario.tiendas_ids = [idTienda];
    this.usuario.tiendas_asignadas = [{
      id_tienda: idTienda,
      nombre: nombreTienda,
      tipo_esquema: 'FIJO',
      hora_entrada: '09:00:00',
      hora_salida: '18:00:00',
      dias_desfase: 0,
      tolerancia_minutos: 15,
      jornada_efectiva: 8,
      config_comidas: []
    }];
  }

  obtenerCatalogoRoles() {
    this._rolService.get().subscribe({
      next: (roles: any) => {
        this.listaRoles = Array.isArray(roles) ? roles : (roles?.data || []); 
        if (this.esEdicion) {
          this.onRolesChanged();
        }
      },
      error: (err) => {
        console.error('Error al cargar catálogo de roles', err);
        this._toastService.show('No se pudieron cargar los roles desde el servidor', 'danger', 'alert-circle-outline');
      }
    });
  }

  onRolesChanged() {
    this.usuario.permisos = {};
    if (!this.usuario.roles || this.usuario.roles.length === 0) return;

    this.usuario.roles.forEach((rolId: string) => {
      const rolEncontrado = this.listaRoles.find(
        (r) => String(r.id || r.slug || r.nombre).toUpperCase() === String(rolId).toUpperCase()
      );

      if (rolEncontrado && rolEncontrado.permisos) {
        const modulos = Object.keys(rolEncontrado.permisos);
        modulos.forEach((nombreModulo) => {
          if (!this.usuario.permisos[nombreModulo]) {
            this.usuario.permisos[nombreModulo] = { acciones_modulo: [], recursos_internos: [] };
          }
          const permisosRolModulo = rolEncontrado.permisos[nombreModulo];
          const permisosUsuarioModulo = this.usuario.permisos[nombreModulo];

          if (permisosRolModulo.acciones_modulo && Array.isArray(permisosRolModulo.acciones_modulo)) {
            permisosUsuarioModulo.acciones_modulo = Array.from(
              new Set([...permisosUsuarioModulo.acciones_modulo, ...permisosRolModulo.acciones_modulo])
            );
          }
          if (permisosRolModulo.recursos_internos && Array.isArray(permisosRolModulo.recursos_internos)) {
            permisosUsuarioModulo.recursos_internos = Array.from(
              new Set([...permisosUsuarioModulo.recursos_internos, ...permisosRolModulo.recursos_internos])
            );
          }
        });
      }
    });
  }

  // AQUÍ SE CORRIGIÓ EL TEXTO PARA LA NUEVA TARJETA
  agregarComida(tienda: any) {
    if (!tienda || !tienda.config_comidas) return;
    
    const numeroComida = tienda.config_comidas.length + 1;
    tienda.config_comidas.push({
      nombre: `Comida/Descanso ${numeroComida}`,
      hora_comida_inicio: '14:00:00',
      hora_comida_fin: '15:00:00',
      dias_desfase_comida_inicio: 0,
      dias_desfase_comida_fin: 0
    });
  }

  // AQUÍ SE CORRIGIÓ EL TEXTO AL REORDENAR DESPUÉS DE ELIMINAR
  removerComida(tienda: any, index: number) {
    if (!tienda || !tienda.config_comidas) return;
    
    tienda.config_comidas.splice(index, 1);
    tienda.config_comidas.forEach((comida: any, idx: number) => {
      comida.nombre = `Comida/Descanso ${idx + 1}`;
    });
  }

  async guardarUsuario() {
    if (!this.usuario.nombre || this.usuario.nombre.trim() === '') {
      this._toastService.show('Por favor ingresa el nombre', 'warning', 'warning-outline');
      return;
    }
    if (!this.usuario.apellido_paterno || this.usuario.apellido_paterno.trim() === '') {
      this._toastService.show('Por favor ingresa el apellido paterno', 'warning', 'warning-outline');
      return;
    }
    if (!this.usuario.usuario || this.usuario.usuario.trim() === '') {
      this._toastService.show('Por favor ingresa el nombre de usuario', 'warning', 'warning-outline');
      return;
    }
    if (!this.usuario.email || this.usuario.email.trim() === '') {
      this._toastService.show('Por favor ingresa el correo electrónico', 'warning', 'warning-outline');
      return;
    }
    
    if (!this.esEdicion && (!this.usuario.contrasena || this.usuario.contrasena.trim().length < 6)) {
      this._toastService.show('La contraseña es requerida y debe tener al menos 6 caracteres', 'warning', 'warning-outline');
      return;
    }

    if (!this.usuario.roles || this.usuario.roles.length === 0) {
      this._toastService.show('Por favor selecciona al menos un rol', 'warning', 'warning-outline');
      return;
    }

    if (this.usuario.tiendas_asignadas && this.usuario.tiendas_asignadas.length > 0) {
      const tiendaActual = this.usuario.tiendas_asignadas[0];
      if (tiendaActual.tipo_esquema === 'LIBRE') {
        delete tiendaActual.hora_entrada;
        delete tiendaActual.hora_salida;
        delete tiendaActual.dias_desfase;
        delete tiendaActual.tolerancia_minutos;
      } else {
        delete tiendaActual.jornada_efectiva;
      }
    }

    const nombreLimpio = this.usuario.nombre.trim();
    const paternoLimpio = this.usuario.apellido_paterno.trim();
    const maternoLimpio = this.usuario.apellido_materno ? this.usuario.apellido_materno.trim() : '';

    if (maternoLimpio !== '') {
      this.usuario.nombre_completo = `${nombreLimpio} ${paternoLimpio} ${maternoLimpio}`;
    } else {
      this.usuario.nombre_completo = `${nombreLimpio} ${paternoLimpio}`;
    }
    
    this.usuario.nombre_completo_search = this.usuario.nombre_completo.toLowerCase();
    this.usuario.usuario_search = this.usuario.usuario.toLowerCase().trim();

    const datosEnviar = { ...this.usuario };

    if (this.esEdicion && (!datosEnviar.contrasena || datosEnviar.contrasena.trim() === '')) {
      delete datosEnviar.contrasena;
    }

    const peticion = this.usuario.id 
      ? this._usuarioService.put(datosEnviar) 
      : this._usuarioService.post(datosEnviar);

    peticion.subscribe({
      next: (res) => {
        const mensajeExito = this.usuario.id 
          ? '¡Usuario actualizado con éxito!' 
          : '¡Usuario registrado con éxito!';

        this._toastService.show(mensajeExito, 'success', 'checkmark-circle-outline');
        this.router.navigate(['/panel-admin/usuarios'], { replaceUrl: true });
      },
      error: (err) => {
        console.error(err);
        let mensajeError = 'Error al conectar con el servidor';
        if (err.error && err.error.message) {
          mensajeError = err.error.message;
        }
        this._toastService.show(mensajeError, 'danger', 'alert-circle-outline');
      }
    });
  }

  cancelar() {
    this.router.navigate(['/panel-admin/usuarios']);
  }
}