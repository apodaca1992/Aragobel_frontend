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

  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.prefijo + '.' + key });
    return value;
  }

  async setItem(key: string, value: string) {
    await Preferences.set({
      key: this.prefijo + '.' + key,
      value: value
    });
  }

  async clearSession() {
    await Preferences.clear();
  }

  // Tip Senior: Método para borrar una sola cosa
  async removeItem(key: string) {
    await Preferences.remove({ key: this.prefijo + '.' + key });
  }
}
