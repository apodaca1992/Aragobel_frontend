import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, IonRouterOutlet, NavController } from "@ionic/angular";
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
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
    private androidPermissions: AndroidPermissions,
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

    // 3. Permisos Nativo
    if (!this.isWeb) {
      this.requestNativePermissions();
    }
  }

  private requestNativePermissions() {
    const permissions = [
      this.androidPermissions.PERMISSION.INTERNET,
      this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
      this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
      this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
      this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
      // Nota: READ_MEDIA_IMAGES es para Android 13+, cuidado con versiones anteriores
      this.androidPermissions.PERMISSION.READ_MEDIA_IMAGES 
    ];

    this.androidPermissions.requestPermissions(permissions);
  }
}
