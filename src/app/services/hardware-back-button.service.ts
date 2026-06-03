import { Injectable } from '@angular/core';
import { 
  Platform, 
  AlertController, 
  IonRouterOutlet, 
  MenuController, 
  ModalController, 
  ActionSheetController, 
  PopoverController 
} from "@ionic/angular";
import { App } from '@capacitor/app';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HardwareBackButtonService {
  private routerOutlet?: IonRouterOutlet;

  constructor(
    private platform: Platform,
    private alertController: AlertController,
    private menuCtrl: MenuController,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private popoverCtrl: PopoverController,
    private router: Router
  ) {}

  /**
   * Centraliza la inicialización. 
   * Un Senior asegura que el evento se registre UNA sola vez.
   */
  public init(outlet: IonRouterOutlet) {
    this.routerOutlet = outlet;
    
    // Usamos subscribeWithPriority para respetar el orden de capas de Ionic
    this.platform.backButton.subscribeWithPriority(10, async () => {
      await this.handleBackButton();
    });
  }

  public async handleBackButton() {
    // 1. Prioridad: Elementos visuales superpuestos (Overlays)
    if (await this.closeOverlays()) return;

    // 2. Prioridad: Menú lateral
    if (await this.menuCtrl.isOpen()) {
      await this.menuCtrl.close();
      return;
    }

    // 3. Prioridad: Navegación interna
    // Si Ionic tiene páginas en el historial, regresa una pantalla
    if (this.routerOutlet?.canGoBack()) {
      this.routerOutlet.pop(); 
      return;
    }

    // 4. Prioridad: Salida de la App (CUALQUIER PÁGINA RAÍZ)
    // Si llegó aquí, significa que ya no hay páginas atrás en el historial.
    // Se cierra la app directamente sin importar la URL actual. 🚀
    App.exitApp();
  }

  /**
   * Cierra cualquier overlay activo (Modal, Popover, etc.)
   * Esto evita que el usuario navegue hacia atrás mientras tiene un diálogo abierto.
   */
  private async closeOverlays(): Promise<boolean> {
    const modal = await this.modalCtrl.getTop();
    if (modal) { await modal.dismiss(); return true; }

    const popover = await this.popoverCtrl.getTop();
    if (popover) { await popover.dismiss(); return true; }

    const actionSheet = await this.actionSheetCtrl.getTop();
    if (actionSheet) { await actionSheet.dismiss(); return true; }

    return false;
  }

  private async presentExitConfirm() {
    // Evitamos duplicar alertas si el usuario presiona muchas veces
    const topAlert = await this.alertController.getTop();
    if (topAlert) return;

    const alert = await this.alertController.create({
      header: 'Salir',
      message: '¿Deseas cerrar la aplicación?',
      backdropDismiss: false,
      cssClass: 'exit-alert', // Para estilos personalizados
      buttons: [
        { text: 'No', role: 'cancel' },
        { 
          text: 'Sí, salir', 
          cssClass: 'secondary',
          handler: () => App.exitApp() 
        }
      ]
    });
    await alert.present();
  }
}