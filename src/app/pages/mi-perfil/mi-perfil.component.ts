import { Component, OnInit, ViewChild } from '@angular/core';
import { IonList } from '@ionic/angular';
import { ComponenteInterface } from '@interfaces/componente-interface';
import { DeviceService } from '@services/device.service';
import { GeolocationService } from '@services/geolocation.service';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss'],
})
export class MiPerfilComponent  implements OnInit {

  @ViewChild(IonList) ionList!: IonList;

  componentes: ComponenteInterface[] = [
    {
      icon: 'heart',
      name: 'prueba',
      redirectTo: '/home'
    },
    {
      icon: 'heart',
      name: 'prueba1',
      redirectTo: '/home'
    }
  ];
  public position: string = 'Prueba';

  constructor(
    private deviceService: DeviceService,
    private geolocationService: GeolocationService
    ) {}

  async ngOnInit() {
    console.log(await this.deviceService.getDeviceId());
    console.log(await this.deviceService.getModel());
    console.log(await this.deviceService.getManufacturer());
    console.log(await this.deviceService.getOperationSystem());
    console.log(await this.deviceService.getOsVersion());
    console.log(await this.deviceService.getPlatform());
    
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

  favorite(user: any) {
    console.log('favorite', user);
    this.ionList.closeSlidingItems();
  }

  share(user: any) {
    console.log('share', user);
    this.ionList.closeSlidingItems();
  }

  delete(user: any) {
    console.log('delete', user.name);
    this.ionList.closeSlidingItems();
  }

}
