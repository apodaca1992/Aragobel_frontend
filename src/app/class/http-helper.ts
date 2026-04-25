import { HttpParams } from '@angular/common/http';

export class HttpHelper {
  /**
   * Convierte un objeto plano en HttpParams para peticiones GET.
   * Maneja conversiones de tipos básicos y evita valores nulos.
   */
  static convertToHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          // Si necesitas manejar fechas mensuales para los reportes:
          if (value instanceof Date) {
            httpParams = httpParams.set(key, value.toISOString());
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }
    return httpParams;
  }

  static getFechaLocal(): string {
    const ahora = new Date();
    // Formateamos usando Intl.DateTimeFormat que es muy estable en Android/Capacitor
    // Esto extrae la fecha ignorando la hora UTC
    const format = new Intl.DateTimeFormat('en-CA', { // 'en-CA' da formato YYYY-MM-DD
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Mazatlan' // Forzamos la zona de Sinaloa
    }).format(ahora);

    return format; // Retorna exactamente "2026-04-24"
  }
}