import { Component, OnInit } from '@angular/core';
import { ComponenteInterface } from '@interfaces/componente-interface';
import { MenuController } from '@ionic/angular';
import { MenuService } from '@services/menu.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent  implements OnInit {

  selectedIndex = 0;
  appPages!: Observable<ComponenteInterface[]>;
  //<ion-icon name="camera-outline"></ion-icon>
  //<ion-icon name="image-outline"></ion-icon>
  //<ion-icon name="image-outline"></ion-icon>
    
  constructor(private menuService: MenuService,
              private menu: MenuController) { }

  ngOnInit() {
    this.appPages = this.menuService.getMenu();
  }

  cerrarSesion(){
    this.menu.close();
		this.menu.enable(false);
  }  

}
