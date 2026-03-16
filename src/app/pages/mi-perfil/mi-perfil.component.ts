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
  public position: string = 'Obteniendo ubicación...';

  constructor(
    private deviceService: DeviceService,
    private geolocationService: GeolocationService
    ) {}

  async ngOnInit() {
    this.logDeviceInfo();
    
    await this.loadCurrentLocation();
  }

  private async logDeviceInfo() {
    console.log(await this.deviceService.getDeviceId());
    console.log(await this.deviceService.getModel());
    console.log(await this.deviceService.getManufacturer());
    console.log(await this.deviceService.getOperationSystem());
    console.log(await this.deviceService.getOsVersion());
    console.log(await this.deviceService.getPlatform());
  }

  private async loadCurrentLocation() {
    const coords = await this.geolocationService.getPosition();

    // AQUÍ ESTÁ EL TRUCO: Si coords no es nulo, TypeScript nos deja usarlo
    if (coords) {
      console.log('Ubicación recibida:', coords);
      this.position = `Latitud: ${coords.latitude} | Longitud: ${coords.longitude}`;
    } else {
      // Si llegamos aquí, el servicio ya mostró un Toast con el error
      this.position = 'Ubicación no disponible';
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
