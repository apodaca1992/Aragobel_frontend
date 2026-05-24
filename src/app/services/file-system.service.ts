import { Injectable } from '@angular/core';
import { Directory, Filesystem, WriteFileResult, Encoding } from '@capacitor/filesystem';
import { environment } from '@env/environment';
import { ToastService } from '@services/toast.service';
import { FileOpener } from '@capawesome-team/capacitor-file-opener'; // 👈 Movemos la importación aquí
import { Capacitor } from '@capacitor/core';

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
  async writeFile(path: string, data: string, esBinario: boolean = false): Promise<WriteFileResult | null> {
    try {
      // Configuramos las opciones dinámicamente
      const opciones: any = {
        path: `${this.prefijo}/${path}`,
        data,
        directory: this.directory,
      };

      // SI NO es binario (es texto plano), le dejamos el UTF8.
      // SI SÍ es binario (nuestros PDFs en Base64), NO le ponemos encoding.
      if (!esBinario) {
        opciones.encoding = Encoding.UTF8;
      }

      return await Filesystem.writeFile(opciones);
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

  /**
   * NUEVO MÉTODO CENTRALIZADO: Guarda un Blob (PDF, Excel, etc.) 
   * y lo descarga en Web o lo abre nativamente en Celular.
   */
  async guardarYAbrirBlob(blob: Blob, nombreArchivo: string, mimeType: string = 'application/pdf'): Promise<void> {
    
    // 🌐 CASO WEB: Descarga tradicional invisible
    if (!Capacitor.isNativePlatform()) {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      return;
    }

    // 📱 CASO NATIVO: Guardado en aragobel_prod y apertura instantánea
    try {
      this.toast.show('Generando y abriendo archivo...', 'success');

      // 1. Convertimos el Blob a Base64 usando el helper privado de abajo
      const base64Data = await this.convertBlobToBase64(blob);

      // 2. Escribimos el archivo usando el método existente de la clase
      const resultado = await this.writeFile(nombreArchivo, base64Data, true);

      if (resultado && resultado.uri) {
        // 3. Abrimos el archivo usando su URI nativa
        await FileOpener.openFile({
          path: resultado.uri,
          mimeType: mimeType
        });
      } else {
        this.toast.show('No se pudo guardar el archivo en el dispositivo.', 'danger');
      }
    } catch (error) {
      console.error('Error en la gestión nativa del archivo:', error);
      this.toast.show('No se pudo abrir el archivo en este dispositivo.', 'danger');
    }
  }

  /**
   * Helper privado para transformar el Binario puro a Base64 nativo
   */
  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(blob);
    });
  }
}