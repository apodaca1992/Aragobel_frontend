// src/app/services/loading.service.ts
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeRequests = 0;
  private loadingElement?: HTMLIonLoadingElement;

  constructor(private loadingCtrl: LoadingController) {}

  async show() {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.loadingElement = await this.loadingCtrl.create({
        message: 'Cargando...',
        spinner: 'crescent',
        translucent: true,
        cssClass: 'custom-loading'
      });
      await this.loadingElement.present();
    }
  }

  async hide() {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      if (this.loadingElement) {
        const element = this.loadingElement; // Referencia local
        this.loadingElement = undefined; // Limpiamos la referencia global inmediatamente
        await element.dismiss();
      }
    }
  }
}