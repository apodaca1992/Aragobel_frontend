import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonRouterOutlet } from "@ionic/angular";
import { HardwareBackButtonService } from '@services/hardware-back-button.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {
  //@ViewChild(IonRouterOutlet, { static: true}) routerOutlet?: IonRouterOutlet;

  @Input() titulo: string = '';
  @Input() backRoute: string = '';
  @Input() showOnlyBtnMenu: boolean = false;
  @Input() showOnlyBtnBack: boolean = false;
  @Input() showOnlyTitle: boolean = true;
  @Input() idMenu: string = '';

  constructor(
    private hardwareBackButtonService: HardwareBackButtonService
  ) { }

  ngOnInit() {}

  backEvent(){
    this.hardwareBackButtonService.canGoBack();
  }

}
