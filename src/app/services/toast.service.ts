import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  async show(message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'primary', icon?: string) {
    const toast = await this.toastController.create({
      message,
      color, // Esto cambia el fondo automáticamente según el tema de Ionic
      duration: 3000,
      position: 'bottom',
      icon: icon || (color === 'danger' ? 'alert-circle-outline' : 'information-circle-outline'),
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ],
      cssClass: 'custom-toast' // Por si quieres darle estilos extra en global.scss
    });

    return await toast.present();
  }

}
