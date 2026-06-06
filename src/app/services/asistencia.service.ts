import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { AsistenciaInterface } from '@interfaces/asistencia-interface';
import { HttpHelper } from '../class/http-helper';

@Injectable({
  providedIn: 'root',
})
export class AsistenciaService {
  private urlApi : string = `${environment.API}/asistencias`;

  constructor(    
    private _httpClient : HttpClient
  ) { }
  
  get(params?: any): Observable<AsistenciaInterface[]> {
    return this._httpClient.get<AsistenciaInterface[]>(`${this.urlApi}`,{ params: HttpHelper.convertToHttpParams(params) } );
  }
  getById(id: string | number): Observable<AsistenciaInterface> {
    return this._httpClient.get<AsistenciaInterface>(`${this.urlApi}/${id}`);
  }
  post(params: AsistenciaInterface): Observable<AsistenciaInterface> {
    return this._httpClient.post<AsistenciaInterface>(`${this.urlApi}`, params);
  }
  put(params: AsistenciaInterface): Observable<AsistenciaInterface> {
    let id : string | number = params.id || '';
    return this._httpClient.put<AsistenciaInterface>(`${this.urlApi}/${id}`, params);
  }
  delete(id: string | number): Observable<AsistenciaInterface> {
    return this._httpClient.delete<AsistenciaInterface>(`${this.urlApi}/${id}`);
  }
  getTime(params?: any): Observable<AsistenciaInterface> {
    return this._httpClient.get<AsistenciaInterface>(`${this.urlApi}/time`,{ params: HttpHelper.convertToHttpParams(params) });
  }
  generarReporte(params?: any): Observable<AsistenciaInterface> {
    return this._httpClient.get<AsistenciaInterface>(`${this.urlApi}/generarReporte`,{ params: HttpHelper.convertToHttpParams(params) });
  }
  obtenerPdfReporte(params?: any): Observable<Blob> {
    return this._httpClient.get<Blob>(`${this.urlApi}/descargarReportePdf`,{ params: HttpHelper.convertToHttpParams(params), responseType: 'blob' as 'json' });
  }
  /**
   * Obtiene la jornada inteligente (activa o la última del día) para un usuario en una tienda específica.
   */
  getJornadaActual(idUsuario: string | number, idTienda: string | number): Observable<AsistenciaInterface> {
    const params = { id_usuario: idUsuario, id_tienda: idTienda, activo: 1 };
    return this._httpClient.get<AsistenciaInterface>(`${this.urlApi}/jornada-actual`, { 
      params: HttpHelper.convertToHttpParams(params) 
    });
  }
}