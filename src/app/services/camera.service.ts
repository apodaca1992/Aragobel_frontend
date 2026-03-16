import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { FileSystemService } from './file-system.service';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor(
    private platform: Platform,
    private fileSystem: FileSystemService
  ) { }

  /**
   * Toma una foto, la guarda permanentemente y retorna la URL para mostrarla en el HTML.
   */
  async takeAndSavePicture(folderName: string) {
    try {
      // 1. Verificar/Solicitar permisos antes de abrir la cámara
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) return null;

      // 2. Capturar la foto
      const capturedPhoto = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        saveToGallery: false,
        source: CameraSource.Camera,
        resultType: this.platform.is('hybrid') ? CameraResultType.Base64 : CameraResultType.Uri
      });

      const fileName = `${folderName}_${new Date().getTime()}.${capturedPhoto.format}`;

      // 3. Manejo por plataforma
      if (this.platform.is('hybrid')) {
        return await this.saveHybridPhoto(folderName, fileName, capturedPhoto);
      } else {
        return capturedPhoto.webPath; // En web no guardamos en FileSystem usualmente
      }
    } catch (error) {
      console.error('Error en CameraService:', error);
      return null;
    }
  }

  private async saveHybridPhoto(folder: string, name: string, photo: Photo) {
    if (!photo.base64String) return null;

    // Aseguramos que la subcarpeta exista
    await this.fileSystem.mkdir(folder);

    // Escribimos el archivo
    const savedFile = await this.fileSystem.writeFile(`${folder}/${name}`, photo.base64String);
    
    // Convertimos la URI nativa a una URL que el <img> de la app pueda leer
    return savedFile ? Capacitor.convertFileSrc(savedFile.uri) : null;
  }

  /**
   * Solo captura y devuelve el Base64 listo para enviar al API (con prefijo)
   */
  async getBase64Picture() {
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    return `data:image/${photo.format};base64,${photo.base64String}`;
  }

  private async checkPermissions(): Promise<boolean> {
    if (!this.platform.is('hybrid')) {
      return true; 
    }
    
    const status = await Camera.checkPermissions();
    if (status.camera !== 'granted') {
      const request = await Camera.requestPermissions();
      return request.camera === 'granted';
    }
    return true;
  }
}