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
}