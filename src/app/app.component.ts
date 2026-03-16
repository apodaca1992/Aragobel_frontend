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
  public isWeb: boolean = false;
  @ViewChild(IonRouterOutlet, { static: false}) routerOutlet?: IonRouterOutlet;

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

  async initializeApp() {
    
    await this.platform.ready();

    // 1. Verificar sesión y cargar menú
     const token = await this._preferencesService.getItem('token');       
      if (token) {
      await this.menu.enable(true, 'MenuPrincipal');
    } else {
      await this.menu.enable(false, 'MenuPrincipal');
    }

    // 2. Hardware y Plataforma
    this.hardwareBackButtonService.init(this.routerOutlet!);
    this.hardwareBackButtonService.initBackButtonEvent();
    const platform = await this.deviceService.getPlatform();
    this.isWeb = platform === 'web';

    // 3. Plugins y Permisos
    await this.databaseService.initializaePlugin();
    this.requestNativePermissions();
  }

  private requestNativePermissions() {
    if (!this.isWeb) {
        this.androidPermissions.requestPermissions([
        this.androidPermissions.PERMISSION.INTERNET,
        this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
        this.androidPermissions.PERMISSION.READ_MEDIA_IMAGES,
        this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
        this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
      ]);
    }
  }
}
