import { Injectable } from '@angular/core';
import { Directory, Filesystem, WriteFileResult, Encoding, WriteFileOptions } from '@capacitor/filesystem';
import { environment } from '@env/environment';
import { ToastService } from '@services/toast.service';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {
  
  private readonly prefijo: string = environment.prefijoLocalStorage;
  private readonly directory: Directory = Directory.Cache; 

  constructor(private toast: ToastService) {
    // Inicialización limpia y silenciosa sin bloquear hilos ni pedir permisos innecesarios
    this.mkdir('').catch(err => console.error('Error al verificar directorio raíz:', err));
  }

  /**
   * Escribe un archivo asegurando preventivamente la existencia de su estructura.
   */
  async writeFile(path: string, data: string, esBinario: boolean = false): Promise<WriteFileResult | null> {
    try {
      // Reutiliza de forma limpia el método de la clase
      await this.mkdir('');

      const opciones: WriteFileOptions = {
        path: `${this.prefijo}/${path}`,
        data,
        directory: this.directory,
      };

      if (!esBinario) {
        opciones.encoding = Encoding.UTF8;
      }

      return await Filesystem.writeFile(opciones);
    } catch (e: any) {
      console.error('Error crítico en writeFile:', e);
      this.toast.show(`Error de escritura: ${e?.message || 'Formato inválido'}`, 'danger');
      return null;
    }
  }

  /**
   * Lee el contenido de un archivo de texto.
   */
  async readFile(path: string): Promise<string | Blob | null> {    
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

  /**
   * Crea un directorio de forma segura controlando excepciones nativas conocidas.
   */
  async mkdir(path: string): Promise<void> {
    try {
      const folderPath = path ? `${this.prefijo}/${path}` : this.prefijo;
      await Filesystem.mkdir({        
        path: folderPath,
        directory: this.directory,
        recursive: true,
      });
    } catch (error: any) {
      // Si el sistema operativo responde que ya existe, avanzamos con confianza
      if (error?.message?.includes('exists') || error?.code === 'DIR_EXISTS') {
        return;
      }
      console.warn('Nota de infraestructura en directorio:', error);
    }
  }

  /**
   * Elimina un archivo específico (Útil para control de caché)
   */
  async deleteFile(path: string): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: `${this.prefijo}/${path}`,
        directory: this.directory
      });
    } catch (e) {
      // Silencioso si el archivo a borrar no existía previamente
      console.log(`No se requería limpieza previa para: ${path}`);
    }
  }

  /**
   * Guarda un Blob y lo expone al sistema nativo o al navegador de manera óptima.
   */
  async guardarYAbrirBlob(blob: Blob, nombreArchivo: string, mimeType: string = 'application/pdf'): Promise<void> {
    
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

    try {
      this.toast.show('Generando y abriendo archivo...', 'success');

      // 🧼 TIP SENIOR: Limpieza preventiva de caché. 
      // Si existía un reporte viejo con el mismo nombre, lo borramos para liberar almacenamiento.
      await this.deleteFile(nombreArchivo);

      const base64Data = await this.convertBlobToBase64(blob);

      if (!base64Data) {
        this.toast.show('Error al procesar la conversión del reporte.', 'danger');
        return;
      }

      const resultado = await this.writeFile(nombreArchivo, base64Data, true);

      if (resultado?.uri) {
        await FileOpener.openFile({
          path: resultado.uri,
          mimeType: mimeType
        });
      }
    } catch (error) {
      console.error('Error en la gestión nativa del archivo:', error);
      this.toast.show('No se pudo abrir el archivo en este dispositivo.', 'danger');
    }
  }

  /**
   * Transforma de manera quirúrgica un Blob binario a cadena Base64 pura.
   */
  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const resultString = reader.result as string;
        const commaIndex = resultString.indexOf(',');
        
        resolve(commaIndex !== -1 ? resultString.substring(commaIndex + 1) : resultString);
      };
      reader.readAsDataURL(blob);
    });
  }
}