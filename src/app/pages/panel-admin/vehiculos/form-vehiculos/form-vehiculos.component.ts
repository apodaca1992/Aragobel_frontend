import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VehiculoService } from '@services/vehiculo.service'; 
import { PreferencesService } from '@services/preference.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-form-vehiculos',
  templateUrl: './form-vehiculos.component.html',
  styleUrls: ['./form-vehiculos.component.scss'],
})
export class FormVehiculosComponent implements OnInit {

  // Estructura fiel al documento de Firestore (image_efe8c8.png)
  vehiculo: any = {
    marca: '',
    modelo: '',
    nombre: '',          // 👈 Ej: "Moto Italika 150"
    nombre_search: '',   // 👈 Ej: "moto italika 150"
    placas: '',
    placas_search: '',   // 👈 Ej: "wlu-94-69"
    tipo: 'auto',        // 👈 Valor por defecto inicial
    activo: 1,
    id_tienda: null
  };

  esEdicion: boolean = false;

  constructor(
    private _vehiculoService: VehiculoService,
    private _preferencesService: PreferencesService,
    private _toastService: ToastService,
    private router: Router
  ) { }

  async ngOnInit() {
    const state = this.router.getCurrentNavigation()?.extras.state;
    
    if (state && state['vehiculo']) {
      this.vehiculo = { ...state['vehiculo'] };
      this.esEdicion = true;
    } else {
      this.esEdicion = false;
      
      const userStr = await this._preferencesService.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.vehiculo.id_tienda = user.id_tienda;
      }    
    }
  }

  async guardarVehiculo() {
    // Validaciones básicas requeridas en la vista
    if (!this.vehiculo.tipo || this.vehiculo.tipo.trim() === '') {
      this._toastService.show('Por favor selecciona el tipo de vehículo', 'warning', 'warning-outline');
      return;
    }
    if (!this.vehiculo.marca || this.vehiculo.marca.trim() === '') {
      this._toastService.show('Por favor ingresa la marca', 'warning', 'warning-outline');
      return;
    }
    if (!this.vehiculo.modelo || this.vehiculo.modelo.trim() === '') {
      this._toastService.show('Por favor ingresa el modelo', 'warning', 'warning-outline');
      return;
    }
    if (!this.vehiculo.placas || this.vehiculo.placas.trim() === '') {
      this._toastService.show('Por favor ingresa las placas', 'warning', 'warning-outline');
      return;
    }

    // ⚡ MAPEADO LOGÍSTICO SEGÚN FIRESTORE (image_efe8c8.png)
    // 1. Formateamos el "tipo" estandarizado (Ej: si dice "Moto", lo capitalizamos para el nombre descriptivo)
    const tipoCapitalizado = this.vehiculo.tipo.charAt(0).toUpperCase() + this.vehiculo.tipo.slice(1);
    
    // 2. Construimos el campo 'nombre' => "Moto Italika 150"
    this.vehiculo.nombre = `${tipoCapitalizado} ${this.vehiculo.marca.trim()} ${this.vehiculo.modelo.trim()}`;
    
    // 3. Construimos el campo 'nombre_search' en minúsculas => "moto italika 150"
    this.vehiculo.nombre_search = this.vehiculo.nombre.toLowerCase();
    
    // 4. Creamos el índice exclusivo para placas en minúsculas => "wlu-94-69"
    this.vehiculo.placas_search = this.vehiculo.placas.toLowerCase().trim();

    // Decidimos la acción HTTP
    const peticion = this.vehiculo.id 
      ? this._vehiculoService.put(this.vehiculo) 
      : this._vehiculoService.post(this.vehiculo);

    peticion.subscribe({
      next: (res) => {
        const mensajeExito = this.vehiculo.id 
          ? '¡Vehículo actualizado con éxito!' 
          : '¡Vehículo registrado con éxito!';

        this._toastService.show(mensajeExito, 'success', 'checkmark-circle-outline');
        this.router.navigate(['/panel-admin/vehiculos'], { replaceUrl: true });
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
    this.router.navigate(['/panel-admin/vehiculos']);
  }
}