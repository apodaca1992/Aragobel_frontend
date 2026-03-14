import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  private prefijo : string = `${environment.prefijoLocalStorage}`;

  constructor(    
  ) { }

  async getItem(key: string){
    //return localStorage.getItem(this.prefijo+'.'+key);    
    return await Preferences.get({key: this.prefijo+'.'+key  });
  }

  async setItem(key: string, value : string){
    //localStorage.setItem(this.prefijo+'.'+key, value);
    await Preferences.set({
      key,
      value,
    });
  }

  async clearSession() {
    await Preferences.clear();
  }
}
