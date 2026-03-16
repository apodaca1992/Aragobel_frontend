import { Injectable } from '@angular/core';
import { Geolocation, PositionOptions } from '@capacitor/geolocation';
import { ToastService } from '@services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private toast: ToastService) {}

  /**
   * Obtiene la posición actual con manejo de errores y permisos.
   */
  async getPosition() {
    try {
      // 1. Validar y solicitar permisos primero
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        this.toast.show('Permisos de ubicación denegados', 'warning');
        return null;
      }

      // 2. Opciones de precisión y tiempo de espera
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 segundos máximo esperando al GPS
        maximumAge: 3000 // Acepta una posición guardada de hace máximo 3 segundos
      };

      const position = await Geolocation.getCurrentPosition(options);
      return position.coords;

    } catch (error: any) {
      this.handleError(error);
      return null;
    }
  }

  private async requestPermissions(): Promise<boolean> {
    const status = await Geolocation.checkPermissions();
    
    if (status.location === 'denied') {
      // Si ya los denegó antes, pedimos que los habilite en ajustes
      return false;
    }

    if (status.location !== 'granted') {
      const requestStatus = await Geolocation.requestPermissions();
      return requestStatus.location === 'granted';
    }

    return true;
  }

  private handleError(error: any) {
    let msg = 'Error al obtener la ubicación';
    
    if (error.code === 1) msg = 'Permiso de ubicación denegado';
    if (error.code === 2) msg = 'Ubicación no disponible (¿GPS apagado?)';
    if (error.code === 3) msg = 'Tiempo de espera agotado';

    console.error('Geolocation Error:', error);
    this.toast.show(msg, 'danger');
  }
}