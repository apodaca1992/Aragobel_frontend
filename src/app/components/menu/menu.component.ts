import { Component, OnInit } from '@angular/core';
import { ComponenteInterface } from '@interfaces/componente-interface';
import { MenuController, NavController } from '@ionic/angular';
import { MenuService } from '@services/menu.service';
import { Observable } from 'rxjs';
import { PreferencesService } from '@services/preference.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  // Ya no necesitamos selectedIndex
  appPages!: Observable<ComponenteInterface[]>;
    
  constructor(
    private menuService: MenuService,
    private menu: MenuController,
    private _preferencesService: PreferencesService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.appPages = this.menuService.getMenu();
  }

  async cerrarSesion() {
    await this._preferencesService.clearSession();
    await this.menu.close('MenuPrincipal');
    await this.menu.enable(false);
    
    this.navCtrl.navigateRoot('/login', {
      animated: true,
      animationDirection: 'back'
    });
  }
}