import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private alertCtrl: AlertController) { }

  /**
   * Muestra un diálogo de confirmación genérico
   * @param header Título del alerta
   * @param message Mensaje opcional
   * @param confirmHandler Función a ejecutar si acepta
   */
  async confirm(header: string, message: string = '', confirmHandler: () => void) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      mode: 'ios', // Forzamos estilo iOS que se ve más limpio para Aragobel
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Aceptar',
          handler: () => {
            confirmHandler();
          }
        }
      ]
    });

    await alert.present();
  }
}