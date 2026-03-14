import { Injectable } from '@angular/core';
import { Platform, AlertController, IonRouterOutlet } from "@ionic/angular";
import { Location } from '@angular/common';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root'
})
export class HardwareBackButtonService {
  public routerOutlet?: IonRouterOutlet;
  constructor(
    private platform: Platform,
    private alertController: AlertController,
    private location: Location
  ) {}

  async init(routerOutlet2: IonRouterOutlet){
    this.routerOutlet = routerOutlet2;
  }

  async initBackButtonEvent(){
    console.log('entro initBackButtonEvent');
    this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('entro subscribeWithPriority');
      if (this.routerOutlet?.canGoBack()){
        this.location.back();
      }else{
        this.backButtonAlert();
      }
    });
  }

  async canGoBack(){
    console.log('entro canGoBack');
    if (this.routerOutlet?.canGoBack()){
      this.location.back();
    }
  }

  async backButtonAlert(){
    const alert = await this.alertController.create({
      message: '¿Desea salir de la applicación?',
      buttons: [{
        text: 'Cancelar',
        role: 'cancelar'
      },{
        text: 'Cerrar App',
        handler: () => {
          App.exitApp(); 
        } 
      }]
    });
    await alert.present();
  }
}
