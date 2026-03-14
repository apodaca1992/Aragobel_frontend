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
  
  async takePicture(){
    console.log(this.urlImage);
    try{
      this.urlImage = await this.cameraService.takePicture('prueba') || ''; 
      this.position = this.urlImage;
    }catch(e:any){
      this.position = e.message;
      if (e instanceof GeolocationPositionError) {
        console.log(e.message);
        this.position = e.message;
      }
    }
  
  }

  async takeLocation(){
    try{
      var location = await (await this.geolocationService.getPosition());
      console.log(location);
      this.position = 'Latitud:' + location.latitude.toString() + ' Longitud:' +  location.longitude.toString();
    }catch(e:any){
      this.position = e.message;
      if (e instanceof GeolocationPositionError) {
        console.log(e.message);
        this.position = e.message;
      }
    }
  }

  async isConnected(){
    this.toastService.show('connected:' + this.networkService.isConnected() + ' name:' + this.networkService.getNameNetwork());
    this.position = 'connected:' + this.networkService.isConnected() + ' name:' + this.networkService.getNameNetwork();
  }

}
