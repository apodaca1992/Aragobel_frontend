import { Injectable } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ActionSheetService {

  constructor(private actionSheetController: ActionSheetController) { }

  /**
   * Muestra un menú de opciones desde la parte inferior
   * @param header Título del menú
   * @param options Arreglo de opciones { text: string, icon?: string, value: any }
   * @param subHeader Subtítulo opcional
   */
  async show<T>(header: string, options: { text: string, icon?: string, value: T }[], subHeader?: string): Promise<T | null> {
    
    return new Promise(async (resolve) => {
      const buttons = options.map(opt => ({
        text: opt.text,
        icon: opt.icon || 'chevron-forward-outline',
        handler: () => {
          resolve(opt.value);
        }
      }));

      // Añadimos siempre el botón de cancelar
      buttons.push({
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          resolve(null);
        }
      } as any);

      const actionSheet = await this.actionSheetController.create({
        header,
        subHeader,
        mode: 'ios', // Se ve mucho más limpio
        cssClass: 'aragobel-action-sheet',
        buttons
      });

      await actionSheet.present();
    });
  }
}