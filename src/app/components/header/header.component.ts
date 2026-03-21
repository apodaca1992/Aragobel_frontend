import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HardwareBackButtonService } from '@services/hardware-back-button.service';

// Definimos un tipo para los modos de cabecera, así evitamos muchos booleanos @Input
export type HeaderMode = 'menu' | 'back' | 'title-only' | 'full';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() titulo: string = '';
  @Input() idMenu: string = 'MenuPrincipal'; // Valor por defecto
  
  // En lugar de 3-4 booleanos, usamos un solo modo para control total
  @Input() mode: HeaderMode = 'full'; 

  // FALTA ESTA LÍNEA:
  @Input() backRoute: string = '/home'; // Ruta por defecto si no hay historial

  constructor(
    private navCtrl: NavController,
    private hardwareBackButtonService: HardwareBackButtonService
  ) { }

  ngOnInit() {}

  /**
   * Navegación hacia atrás integrada.
   * Un Senior usa NavController para asegurar que las animaciones de Ionic
   * sean fluidas y respeten el stack de navegación.
   */
  // Este método es opcional si usas ion-back-button nativo, 
  // pero es bueno tenerlo por si quieres forzar una salida manual.
  async backEvent() {
    await this.hardwareBackButtonService.handleBackButton();
  }
}