import { Injectable } from '@angular/core';
import { Directory, Filesystem, WriteFileResult, Encoding  } from '@capacitor/filesystem';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {
  
  private prefijoLocalStorage : string = `${environment.prefijoLocalStorage}`;
  private directory : Directory = Directory.Documents; 

  constructor() { 
    Filesystem.checkPermissions();
    //creamos la carpeta principal de la app
    //this.mkdir(this.prefijoLocalStorage);
  }

  async writeFile(path:string, data:string|Blob):Promise<WriteFileResult>{
    console.log(this.directory);
    return await Filesystem.writeFile({
      path: this.prefijoLocalStorage + '/' + path,
      data,
      directory: this.directory,
      //encoding: Encoding.UTF8,
    });
  }

  async readFile(path:string){    
    console.log(this.prefijoLocalStorage + '/' + path);
    return await Filesystem.readFile({      
      path: this.prefijoLocalStorage + '/' + path,
      //encoding: Encoding.UTF8,
    });
  }

  async mkdir(path:string){
    try {
      // Si el directorio no existe, lo creas
      await Filesystem.mkdir({        
        path: this.prefijoLocalStorage + '/' + path, // El directorio donde guardarás el archivo
        directory: this.directory,
        recursive: true, // Esto garantiza que se creen todos los subdirectorios si no existen
      });
    } catch (error) {
      console.log(error);
    }
  }
}
