import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, IonRouterOutlet } from "@ionic/angular";
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
  public isWeb: boolean;  
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
    this.isWeb = false;
    this.initializeApp();
  }

  initializeApp() {
    
    console.log("initializeApp ");
    this.platform.ready().then(async () => {
      const token = await this._preferencesService.getItem('token'); 
      
      if (token) {
        await this.menu.enable(true, 'MenuPrincipal');
      } else {
        await this.menu.enable(false, 'MenuPrincipal');
      }

      this.hardwareBackButtonService.init(this.routerOutlet!);
      this.hardwareBackButtonService.initBackButtonEvent();

       // Comprobamos si estamos en web
       const platform = await this.deviceService.getPlatform();
       this.isWeb = platform == 'web';
 
      await this.databaseService.initializaePlugin();
      if (!this.isWeb) {
        console.log("requestPermissions ");
        this.androidPermissions.requestPermissions([
          this.androidPermissions.PERMISSION.INTERNET,
          this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
          this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
          this.androidPermissions.PERMISSION.READ_MEDIA_IMAGES,
          this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
          this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
        ]);
      }
    });
  }
}
