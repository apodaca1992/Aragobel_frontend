import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { FileSystemService } from './file-system.service';


@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor(private platform: Platform,
              private fileSystem: FileSystemService) {     
    Camera.checkPermissions();
  }

  async takePicture(nameFile:string){
    const capturedPhoto = await Camera.getPhoto({
      quality: 80,
      saveToGallery: false,
      source: CameraSource.Camera, // automatically take a new photo with the camera
      resultType: this.platform.is('hybrid') ? CameraResultType.Base64 : CameraResultType.Uri
    });

    // Write the file to the data directory
    const fileName = nameFile + '_' + new Date().getTime() + '.' + capturedPhoto.format;

    if (this.platform.is('hybrid')) {     
      // Convert photo to base64 format, required by Filesystem API to save
      const base64Data = capturedPhoto.base64String!; //await this.readAsBase64(photo);
      
      //const prefix = `data:image/${capturedPhoto.format};base64,`;
      const base64Complete = base64Data;

      console.log(fileName);
      console.log(base64Complete);
      //create folder
      await this.fileSystem.mkdir(nameFile); 
      
      console.log(nameFile);
      
      const savedFile = await this.fileSystem.writeFile(nameFile + '/' + fileName, base64Complete); 

      console.log("paso writeFile");
      console.log(savedFile.uri);

      return  Capacitor.convertFileSrc(savedFile.uri);
    } else {            
      return  capturedPhoto.webPath;
    }
  }

  // Save picture to file on device
  async savePictureBase64(nameFolder: string) { 
    
    const capturedPhoto = await Camera.getPhoto({
      quality: 80,
      saveToGallery: false,
      source: CameraSource.Camera, // automatically take a new photo with the camera
      resultType: this.platform.is('hybrid') ? CameraResultType.Base64 : CameraResultType.Uri
    });
    // Write the file to the data directory
    const fileName = nameFolder + '_' + new Date().getTime() + '.' + capturedPhoto.format;
   
      // Convert photo to base64 format, required by Filesystem API to save
      const base64Data = capturedPhoto.base64String!; //await this.readAsBase64(photo);

      const prefix = `data:image/${capturedPhoto.format};base64,`;

      return prefix + base64Data;
  }

  // Read camera photo into base64 format based on the platform the app is running on
  private async readAsBase64(photo: Photo) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await this.fileSystem.readFile(photo.path!); 
      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return (await this.convertBlobToBase64(blob)) as string;
    }
  }

  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
  });

}
