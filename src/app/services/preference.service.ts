import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Preferences } from '@capacitor/preferences';

// Tip Senior: Definimos interfaces para mantener el tipado fuerte y evitar bugs de tipografía
export interface DetallePermiso {
  recursos_internos: string[];
  acciones_modulo: string[];
}

export interface PermisosEstructura {
  [modulo: string]: DetallePermiso;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  private prefijo : string = `${environment.prefijoLocalStorage}`;

  constructor() { }

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

  async removeItem(key: string) {
    await Preferences.remove({ key: this.prefijo + '.' + key });
  }

  /**
   * CORREGIDO: Evalúa permisos basándose en la nueva estructura de acciones_modulo
   * @example tienePermiso('CHECADOR', 'CREAR') -> true
   */
  async tienePermiso(modulo: string, accion: string): Promise<boolean> {
    const data = await this.getItem('permisos');
    if (!data) return false;
    
    try {
      const permisos: PermisosEstructura = JSON.parse(data);
      
      // Validamos si existe el módulo y si la acción solicitada está dentro de acciones_modulo
      if (permisos[modulo] && permisos[modulo].acciones_modulo) {
        return permisos[modulo].acciones_modulo.includes(accion.toUpperCase());
      }
      
      return false;
    } catch (error) {
      console.error('Error al parsear los permisos del Storage:', error);
      return false;
    }
  }

  /**
   * NUEVO: Valida si el usuario tiene acceso a un recurso específico dentro de un módulo
   * @example tieneAccesoARecurso('CHECADOR', 'ASISTENCIAS') -> true
   */
  async tieneAccesoARecurso(modulo: string, recurso: string): Promise<boolean> {
    const data = await this.getItem('permisos');
    if (!data) return false;

    try {
      const permisos: PermisosEstructura = JSON.parse(data);
      if (permisos[modulo] && permisos[modulo].recursos_internos) {
        return permisos[modulo].recursos_internos.includes(recurso.toUpperCase());
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async esAdmin(): Promise<boolean> {
    const data = await this.getItem('roles');
    if (!data) return false;
    
    return data.includes('ADMINISTRADOR');
  }

  async getIdUser(): Promise<string> {
    const data = await this.getItem('user');
    if (!data) return '';

    const obj = JSON.parse(data);
    return obj.id || '';
  }
}