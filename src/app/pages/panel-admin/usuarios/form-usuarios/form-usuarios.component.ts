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
      dias_desfase: '0',        
      tolerancia_minutos: '15',  
      jornada_efectiva: null,    
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

  getRolId(rol: any): string {
    return rol.id || rol.slug || rol.nombre;
  }

  onRolesChanged() {
    this.usuario.permisos = {};
    if (!this.usuario.roles || this.usuario.roles.length === 0) return;

    this.usuario.roles.forEach((rolId: string) => {
      const rolEncontrado = this.listaRoles.find(
        (r) => String(this.getRolId(r)).toUpperCase() === String(rolId).toUpperCase()
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

  agregarComida(tienda: any) {
    if (!tienda || !tienda.config_comidas) return;
    
    const numeroComida = tienda.config_comidas.length + 1;
    const nuevaComida: any = {
      nombre: `Comida/Descanso ${numeroComida}`
    };

    if (tienda.tipo_esquema === 'LIBRE') {
      nuevaComida.tiempo_comida_max = null; 
    } else {
      nuevaComida.hora_comida_inicio = '14:00:00'; 
      nuevaComida.hora_comida_fin = '15:00:00';      
      nuevaComida.dias_desfase_comida_inicio = 0; 
      nuevaComida.dias_desfase_comida_fin = 0;    
    }

    tienda.config_comidas.push(nuevaComida);
  }

  removerComida(tienda: any, index: number) {
    if (!tienda || !tienda.config_comidas) return;
    
    tienda.config_comidas.splice(index, 1);
    tienda.config_comidas.forEach((comida: any, idx: number) => {
      comida.nombre = `Comida/Descanso ${idx + 1}`;
    });
  }

  esHorarioInvalido(): boolean {
    if (!this.usuario.tiendas_asignadas || this.usuario.tiendas_asignadas.length === 0) return false;
    const tienda = this.usuario.tiendas_asignadas[0];
    
    if (tienda.tipo_esquema === 'FIJO') {
      const baseInvalida = (
        !tienda.hora_entrada || String(tienda.hora_entrada).trim() === '' || 
        !tienda.hora_salida || String(tienda.hora_salida).trim() === '' ||
        tienda.dias_desfase === null || tienda.dias_desfase === undefined || String(tienda.dias_desfase).trim() === '' ||
        tienda.tolerancia_minutos === null || tienda.tolerancia_minutos === undefined || String(tienda.tolerancia_minutos).trim() === ''
      );

      if (baseInvalida) return true;

      if (tienda.config_comidas && tienda.config_comidas.length > 0) {
        for (const comida of tienda.config_comidas) {
          const comidaInvalida = (
            !comida.hora_comida_inicio || String(comida.hora_comida_inicio).trim() === '' ||
            !comida.hora_comida_fin || String(comida.hora_comida_fin).trim() === '' ||
            comida.dias_desfase_comida_inicio === null || comida.dias_desfase_comida_inicio === undefined || String(comida.dias_desfase_comida_inicio).trim() === '' ||
            comida.dias_desfase_comida_fin === null || comida.dias_desfase_comida_fin === undefined || String(comida.dias_desfase_comida_fin).trim() === ''
          );
          if (comidaInvalida) return true; 
        }
      }
    } 
    else if (tienda.tipo_esquema === 'LIBRE') {
      const baseLibreInvalida = tienda.jornada_efectiva === null || tienda.jornada_efectiva === undefined || String(tienda.jornada_efectiva).trim() === '';
      if (baseLibreInvalida) return true;

      if (tienda.config_comidas && tienda.config_comidas.length > 0) {
        for (const comida of tienda.config_comidas) {
          if (comida.tiempo_comida_max === null || comida.tiempo_comida_max === undefined || String(comida.tiempo_comida_max).trim() === '') {
            return true; 
          }
        }
      }
    }
    return false;
  }

  // FUNCIÓN AUXILIAR ESTRICTA PARA EXTRAER SOLAMENTE "HH:mm:ss"
  private limpiarFormatoHora(valorHora: any): string {
    if (!valorHora) return '00:00:00';
    
    const cadena = String(valorHora).trim();
    
    // Si viene un formato ISO completo (ej: 2026-06-04T18:06:00-06:00)
    if (cadena.includes('T')) {
      const parteTiempo = cadena.split('T')[1]; // Nos quedamos con "18:06:00-06:00"
      const tiempoLimpio = parteTiempo.substring(0, 8); // Extraemos exactamente "18:06:00"
      return tiempoLimpio;
    }
    
    // Si viene solo tiempo parcial o completo (ej: "18:06" o "18:06:00")
    const partes = cadena.split(':');
    if (partes.length === 2) {
      return `${cadena}:00`;
    } else if (partes.length >= 3) {
      return `${partes[0]}:${partes[1]}:${partes[2].substring(0, 2)}`;
    }
    
    return cadena;
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

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.usuario.email)) {
      this._toastService.show('El formato del correo electrónico no es válido', 'danger', 'alert-circle-outline');
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

    if (this.esHorarioInvalido()) {
      const tienda = this.usuario.tiendas_asignadas[0];
      const mensaje = tienda.tipo_esquema === 'FIJO' 
        ? 'Verifica que el horario de la tienda y todos los campos de los tiempos de comida estén completos.' 
        : 'Para el esquema Libre, la jornada diaria y el tiempo máximo de descanso son requeridos.';
      this._toastService.show(mensaje, 'warning', 'time-outline');
      return;
    }

    const datosEnviar = JSON.parse(JSON.stringify(this.usuario));

    if (datosEnviar.tiendas_asignadas && datosEnviar.tiendas_asignadas.length > 0) {
      const tiendaActual = datosEnviar.tiendas_asignadas[0];
      
      // PROCESADO Y LIMPIEZA INMEDIATA DE DATETIME ISO A STRING TIME SEGURO (HH:mm:ss)
      if (tiendaActual.tipo_esquema === 'FIJO') {
        tiendaActual.hora_entrada = this.limpiarFormatoHora(tiendaActual.hora_entrada);
        tiendaActual.hora_salida = this.limpiarFormatoHora(tiendaActual.hora_salida);
      }

      if (!tiendaActual.config_comidas || !Array.isArray(tiendaActual.config_comidas) || tiendaActual.config_comidas.length === 0) {
        tiendaActual.config_comidas = [];
      } else {
        tiendaActual.config_comidas = tiendaActual.config_comidas.map((comida: any) => {
          if (tiendaActual.tipo_esquema === 'LIBRE') {
            delete comida.hora_comida_inicio;
            delete comida.hora_comida_fin;
            delete comida.dias_desfase_comida_inicio;
            delete comida.dias_desfase_comida_fin;
            comida.tiempo_comida_max = Number(comida.tiempo_comida_max);
          } else {
            // Limpieza estricta de las horas de comida
            comida.hora_comida_inicio = this.limpiarFormatoHora(comida.hora_comida_inicio);
            comida.hora_comida_fin = this.limpiarFormatoHora(comida.hora_comida_fin);
            
            delete comida.tiempo_comida_max;
            comida.dias_desfase_comida_inicio = Number(comida.dias_desfase_comida_inicio);
            comida.dias_desfase_comida_fin = Number(comida.dias_desfase_comida_fin);
          }

          Object.keys(comida).forEach(key => {
            if (comida[key] === '' || comida[key] === null || comida[key] === undefined) {
              delete comida[key];
            }
          });
          return comida;
        });
      }

      if (tiendaActual.tipo_esquema === 'LIBRE') {
        delete tiendaActual.hora_entrada;
        delete tiendaActual.hora_salida;
        delete tiendaActual.dias_desfase;
        delete tiendaActual.tolerancia_minutos;
        tiendaActual.jornada_efectiva = Number(tiendaActual.jornada_efectiva);
      } else {
        delete tiendaActual.jornada_efectiva;
        tiendaActual.dias_desfase = Number(tiendaActual.dias_desfase);
        tiendaActual.tolerancia_minutos = Number(tiendaActual.tolerancia_minutos);
      }

      Object.keys(tiendaActual).forEach(key => {
        if (tiendaActual[key] === '' || tiendaActual[key] === null || tiendaActual[key] === undefined) {
          delete tiendaActual[key];
        }
      });
    }

    const nombreLimpio = datosEnviar.nombre.trim();
    const paternoLimpio = datosEnviar.apellido_paterno.trim();
    const maternoLimpio = datosEnviar.apellido_materno ? datosEnviar.apellido_materno.trim() : '';

    if (maternoLimpio !== '') {
      datosEnviar.nombre_completo = `${nombreLimpio} ${paternoLimpio} ${maternoLimpio}`;
    } else {
      datosEnviar.nombre_completo = `${nombreLimpio} ${paternoLimpio}`;
    }
    
    datosEnviar.nombre_completo_search = datosEnviar.nombre_completo.toLowerCase();
    datosEnviar.usuario_search = datosEnviar.usuario.toLowerCase().trim();

    if (this.esEdicion && (!datosEnviar.contrasena || datosEnviar.contrasena.trim() === '')) {
      delete datosEnviar.contrasena;
    }

    if (!datosEnviar.apellido_materno || datosEnviar.apellido_materno.trim() === '') {
      delete datosEnviar.apellido_materno;
    }

    const peticion = datosEnviar.id 
      ? this._usuarioService.put(datosEnviar) 
      : this._usuarioService.post(datosEnviar);

    peticion.subscribe({
      next: (res) => {
        const mensajeExito = datosEnviar.id 
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