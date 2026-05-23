import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, IonRouterOutlet } from "@ionic/angular";
import { DatabaseService } from '@services/database.service';
import { DeviceService } from '@services/device.service';
import { HardwareBackButtonService } from '@services/hardware-back-button.service';
import { PreferencesService } from '@services/preference.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  @ViewChild(IonRouterOutlet, { static: true}) routerOutlet!: IonRouterOutlet;
  public isWeb: boolean = false;

  constructor(
    private platform: Platform,
    // SE ELIMINÓ: androidPermissions de aquí
    private databaseService: DatabaseService,
    private deviceService: DeviceService,
    private menu: MenuController,
    private hardwareBackButtonService: HardwareBackButtonService,
    private _preferencesService: PreferencesService
  ) {
    this.initializeApp();
  }

  // Usamos AfterViewInit para asegurar que los componentes de Ionic estén listos
  ngAfterViewInit() {
    // Inicializamos el botón de atrás con el outlet ya renderizado
    this.hardwareBackButtonService.init(this.routerOutlet);
  }

  async initializeApp() {
    await this.platform.ready();

    // 1. Verificar sesión y cargar menú
    const token = await this._preferencesService.getItem('token');       
    await this.menu.enable(!!token, 'MenuPrincipal');

    // 2. Plataforma y Base de Datos
    const platform = await this.deviceService.getPlatform();
    this.isWeb = platform === 'web';

    try {
      const initialized = await this.databaseService.initializaePlugin();
      if (initialized) {
        console.log("Base de datos lista");
      }
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
    }

    // NOTA: Se removió la llamada masiva a requestNativePermissions().
    // Ahora cada plugin de Capacitor (Cámara, GPS) pedirá su propio permiso 
    // justamente cuando el usuario intente usar dicha función en la app.
  }
}