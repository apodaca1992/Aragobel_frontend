import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() { 
    Geolocation.checkPermissions();
  }

  async getPosition(){
    return await (await Geolocation.getCurrentPosition({enableHighAccuracy: true})).coords;
  }
}
