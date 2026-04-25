import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { VehiculoInterface } from '@interfaces/vehiculo-interface';
import { HttpHelper } from '../class/http-helper';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private urlApi : string = `${environment.API}/vehiculos`;

  constructor(    
    private _httpClient : HttpClient
  ) { }
  
  get(params?: any): Observable<VehiculoInterface[]> {
    return this._httpClient.get<VehiculoInterface[]>(`${this.urlApi}`,{ params: HttpHelper.convertToHttpParams(params) } );
  }
  getById(id: string | number): Observable<VehiculoInterface> {
    return this._httpClient.get<VehiculoInterface>(`${this.urlApi}/${id}`);
  }
  post(params: VehiculoInterface): Observable<VehiculoInterface> {
    return this._httpClient.post<VehiculoInterface>(`${this.urlApi}`, params);
  }
  put(params: VehiculoInterface): Observable<VehiculoInterface> {
    let id : string | number = params.id || '';
    return this._httpClient.put<VehiculoInterface>(`${this.urlApi}/${id}`, params);
  }
  delete(id: string | number): Observable<VehiculoInterface> {
    return this._httpClient.delete<VehiculoInterface>(`${this.urlApi}/${id}`);
  }
}