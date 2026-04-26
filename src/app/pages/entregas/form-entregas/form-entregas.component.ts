import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EntregaService } from '@services/entrega.service';
import { PreferencesService } from '@services/preference.service';
import { EntregaInterface } from '@interfaces/entrega-interface';
import { HttpHelper } from '../../../class/http-helper';
import { ToastService } from '@services/toast.service'; // Tu servicio de toast

@Component({
  selector: 'app-form-entregas',
  templateUrl: './form-entregas.component.html',
  styleUrls: ['./form-entregas.component.scss'],
})
export class FormEntregasComponent  implements OnInit {

  // Objeto con la estructura que pediste
  entrega: Partial<EntregaInterface> = {
    folio: '',
    persona_recibe: '',
    colonia: '',
    estatus: 1,
    activo: 1,
    id_tienda: null,
    id_usuario_creador: null,
    fecha_venta: ''
  };

  constructor(
    private _entregaService: EntregaService,
    private _preferencesService: PreferencesService,
    private router: Router,
    private _toastService: ToastService
  ) { }

  async ngOnInit() {
    // 1. Primero capturamos si viene una entrega para edición
    const state = this.router.getCurrentNavigation()?.extras.state;
    
    if (state && state['entrega']) {
      // CASO EDICIÓN: Copiamos los datos existentes
      this.entrega = { ...state['entrega'] };
      console.log('Modo edición:', this.entrega);
    } else {
      // CASO NUEVA ENTREGA: Seteamos valores por defecto
      console.log('Modo creación');
      this.entrega.id_usuario_creador = await this._preferencesService.getIdUser();
      
      const userStr = await this._preferencesService.getItem('user');
      if (userStr) {
          const user = JSON.parse(userStr);
          this.entrega.id_tienda = user.id_tienda;
      }
      
      // Generamos la fecha del día para el filtro rápido
      this.entrega.fecha_venta = 'TODAY';
    }
  }

  async guardar() {
    // Validación básica
    if (!this.entrega.folio || !this.entrega.persona_recibe || !this.entrega.colonia) {
      this._toastService.show('Por favor rellena todos los campos', 'warning', 'warning-outline');
      return;
    }

    // Decidimos si es POST (nuevo) o PUT (editar)
    const peticion = this.entrega.id 
      ? this._entregaService.put(this.entrega as EntregaInterface) 
      : this._entregaService.post(this.entrega as EntregaInterface);

    peticion.subscribe({
      next: (res) => {
        this._toastService.show('¡Entrega guardada con éxito!', 'success', 'checkmark-circle-outline');
        this.router.navigate(['/entregas'], { replaceUrl: true }); // Regresamos a la lista
      },
      error: (err) => {
        this._toastService.show('Error al conectar con el servidor', 'danger');
        console.error(err);
      }
    });
  }
}
