import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormClass } from '@class/form-class';
import { NetworkService } from '@services/network.service';
import { ToastService } from '@services/toast.service';
import { CameraService } from '@services/camera.service';
import { GeolocationService } from '@services/geolocation.service';

@Component({
  selector: 'app-form-mi-formulario',
  templateUrl: './form-mi-formulario.component.html',
  styleUrls: ['./form-mi-formulario.component.scss'],
})
export class FormMiFormularioComponent  extends FormClass implements OnInit  {
 
  public urlImage?: string = '/assets/shapes.svg';
  public position?: string = 'Prueba';

  constructor(
    private networkService: NetworkService,
    private toastService: ToastService,
    private cameraService: CameraService,
    private geolocationService: GeolocationService
  ) { super(); }

  ngOnInit() {}
  
  async takePicture() {
    try {
      const photo = await this.cameraService.takePicture('prueba');
      
      if (photo) {
        this.urlImage = photo;
        this.position = 'Imagen capturada correctamente';
      }
    } catch (e: any) {
      this.toastService.show('Cámara cancelada o error', 'warning');
    }
  }

async takeLocation() {
    try {
      // 1. Obtenemos la posición (un solo await basta)
      const location = await this.geolocationService.getPosition();

      // 2. Validación de seguridad para TypeScript
      if (location) {
        console.log(location);
        this.position = `Latitud: ${location.latitude} | Longitud: ${location.longitude}`;
      } else {
        // El servicio ya disparó un Toast, así que solo actualizamos el estado local
        this.position = 'No se pudo obtener la ubicación.';
      }

    } catch (e: any) {
      this.position = 'Error de ubicación: ' + e.message;
      // Nota: Si usas Capacitor Geolocation, el error no siempre es "instanceof GeolocationPositionError"
      // pero el catch capturará cualquier fallo de hardware.
    }
  }

  async isConnected(){
    this.toastService.show('connected:' + this.networkService.isConnected());
    this.position = 'connected:' + this.networkService.isConnected();
  }

}
