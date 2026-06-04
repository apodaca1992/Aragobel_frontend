import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '@services/usuario.service'; 
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
    tiendas_ids: [],            // 👈 CORREGIDO: Ahora es un arreglo de strings en lugar de un id individual
    roles: ['repartidor']        
  };

  esEdicion: boolean = false;
  mostrarPassword: boolean = false; 

  constructor(
    private _usuarioService: UsuarioService,
    private _preferencesService: PreferencesService,
    private _toastService: ToastService,
    private router: Router
  ) { }

  async ngOnInit() {
    const state = this.router.getCurrentNavigation()?.extras.state;
    
    if (state && state['usuario']) {
      this.usuario = { ...state['usuario'] };
      this.usuario.contrasena = ''; 
      
      // Aseguramos que si por alguna razón 'tiendas_ids' no existe en el objeto que viene, se inicialice como arreglo
      if (!this.usuario.tiendas_ids) {
        this.usuario.tiendas_ids = [];
      }
      this.esEdicion = true;
    } else {
      this.esEdicion = false;
      
      const userStr = await this._preferencesService.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // 👈 CORREGIDO: Insertamos el ID de la tienda actual dentro del arreglo de strings
        if (user.id_tienda) {
          this.usuario.tiendas_ids = [String(user.id_tienda)];
        }
      }    
    }
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

    // Clonamos el objeto de envío para manipular contrasena de forma segura
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