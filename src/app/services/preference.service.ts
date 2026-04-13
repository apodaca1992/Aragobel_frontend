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

  async tienePermiso(modulo: string, accion: string): Promise<boolean> {
    const data = await this.getItem('permisos');
    if (!data) return false;
    
    const obj = JSON.parse(data);
    return obj[modulo] && obj[modulo].includes(accion);
  }

  async esAdmin(): Promise<boolean> {
    const data = await this.getItem('roles');
    if (!data) return false;
    
    if (data.includes('ADMINISTRADOR')) 
      return true;
    else 
      return false;
  }

  async getIdUser(): Promise<string> {
    const data = await this.getItem('user');
    if (!data) return '';

    const obj = JSON.parse(data);
    return obj.id;
  }
}
