import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  constructor(    
    private loadingController: LoadingController
  ) { }

  async show(message: string){
    const loading = await this.loadingController.create({
      message
    });
    return loading.present();
  }

  async dismiss(){
    this.loadingController.dismiss();
  }
}
