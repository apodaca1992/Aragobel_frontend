import { Injectable } from '@angular/core';
import { Directory, Filesystem, WriteFileResult, Encoding } from '@capacitor/filesystem';
import { environment } from '@env/environment';
import { ToastService } from '@services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {
  
  private prefijo: string = environment.prefijoLocalStorage;
  private directory: Directory = Directory.Documents; 

  constructor(private toast: ToastService) {
    // No bloqueamos el constructor, pero inicializamos la carpeta base
    this.initStorage();
  }

  private async initStorage() {
    try {
      const status = await Filesystem.checkPermissions();
      if (status.publicStorage !== 'granted') {
        await Filesystem.requestPermissions();
      }
      await this.mkdir(''); // Crea la carpeta raíz de la app
    } catch (e) {
      console.error('Error inicializando FileSystem', e);
    }
  }

  /**
   * Escribe un archivo. 
   * Tip Senior: En Capacitor, para archivos binarios (fotos), 
   * es mejor manejar Base64 para evitar problemas de encoding.
   */
  async writeFile(path: string, data: string): Promise<WriteFileResult | null> {
    try {
      return await Filesystem.writeFile({
        path: `${this.prefijo}/${path}`,
        data,
        directory: this.directory,
        encoding: Encoding.UTF8, // Usar UTF8 para texto/base64
      });
    } catch (e) {
      this.toast.show('Error al escribir archivo', 'danger');
      return null;
    }
  }

  async readFile(path: string) {    
    try {
      const result = await Filesystem.readFile({      
        path: `${this.prefijo}/${path}`,
        directory: this.directory,
        encoding: Encoding.UTF8,
      });
      return result.data;
    } catch (e) {
      console.error('Error leyendo archivo', e);
      return null;
    }
  }

  async mkdir(path: string) {
    try {
      const folderPath = path ? `${this.prefijo}/${path}` : this.prefijo;
      await Filesystem.mkdir({        
        path: folderPath,
        directory: this.directory,
        recursive: true,
      });
    } catch (error) {
      // Si el error es que ya existe, no hacemos nada
      console.warn('El directorio ya podría existir');
    }
  }

  /**
   * Útil para limpiar archivos temporales o caché
   */
  async deleteFile(path: string) {
    await Filesystem.deleteFile({
      path: `${this.prefijo}/${path}`,
      directory: this.directory
    });
  }
}