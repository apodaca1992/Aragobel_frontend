import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColoniaService } from '@services/colonia.service'; 
import { PreferencesService } from '@services/preference.service';
import { ToastService } from '@services/toast.service';

// ⚠️ ASEGÚRATE DE QUE ESTE DECORADOR ESTÉ BIEN ESCRITO JUSTO AQUÍ:
@Component({
  selector: 'app-form-colonias',
  templateUrl: './form-colonias.component.html',
  styleUrls: ['./form-colonias.component.scss'],
})
export class FormColoniasComponent implements OnInit {

  colonia: any = {
    nombre: '',
    activo: 1,
    id_tienda: null,
    id_usuario_creador: null,
    nombre_usuario_creador: ''
  };

  esEdicion: boolean = false;

  constructor(
    private _coloniasService: ColoniaService,
    private _preferencesService: PreferencesService,
    private _toastService: ToastService,
    private router: Router
  ) { }

  async ngOnInit() {
    const state = this.router.getCurrentNavigation()?.extras.state;
    
    if (state && state['colonia']) {
      this.colonia = { ...state['colonia'] };
      this.esEdicion = true;
    } else {
      this.esEdicion = false;
      this.colonia.id_usuario_creador = await this._preferencesService.getIdUser();      
      
      const userStr = await this._preferencesService.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.colonia.id_tienda = user.id_tienda;
        this.colonia.nombre_usuario_creador = user.nombre + ' ' + user.apellido_paterno + ' ' + user.apellido_materno;
      }    
    }
  }

  async guardarColonia() {
    if (!this.colonia.nombre || this.colonia.nombre.trim() === '') {
      this._toastService.show('Por favor ingresa un nombre válido para la colonia', 'warning', 'warning-outline');
      return;
    }

    const peticion = this.colonia.id 
      ? this._coloniasService.put(this.colonia) 
      : this._coloniasService.post(this.colonia);

    peticion.subscribe({
      next: (res) => {
        const mensajeExito = this.colonia.id 
          ? '¡Colonia actualizada con éxito!' 
          : '¡Colonia registrada con éxito!';

        this._toastService.show(mensajeExito, 'success', 'checkmark-circle-outline');
        this.router.navigate(['/panel-admin/colonias'], { replaceUrl: true });
      },
      error: (err) => {
        console.error(err);
        let mensajeError = 'Error al conectar con el servidor';
        if (err.error && err.error.message) {
          mensajeError = err.error.message;
        } else if (typeof err.error === 'string') {
          mensajeError = err.error;
        }
        this._toastService.show(mensajeError, 'danger', 'alert-circle-outline');
      }
    });
  }

  cancelar() {
    this.router.navigate(['/panel-admin/colonias']);
  }
}