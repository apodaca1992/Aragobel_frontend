import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { TiendaInterface } from '@interfaces/tienda-interface';
import { HttpHelper } from '../class/http-helper';

@Injectable({
  providedIn: 'root',
})
export class TiendaService {
  private urlApi : string = `${environment.API}/tiendas`;

  constructor(    
    private _httpClient : HttpClient
  ) { }
  
  get(params?: any): Observable<TiendaInterface[]> {
    return this._httpClient.get<TiendaInterface[]>(`${this.urlApi}`,{ params: HttpHelper.convertToHttpParams(params) } );
  }
  getById(id: string | number): Observable<TiendaInterface> {
    return this._httpClient.get<TiendaInterface>(`${this.urlApi}/${id}`);
  }
  post(params: TiendaInterface): Observable<TiendaInterface> {
    return this._httpClient.post<TiendaInterface>(`${this.urlApi}`, params);
  }
  put(params: TiendaInterface): Observable<TiendaInterface> {
    let id : string | number = params.id || '';
    return this._httpClient.put<TiendaInterface>(`${this.urlApi}/${id}`, params);
  }
  delete(id: string | number): Observable<TiendaInterface> {
    return this._httpClient.delete<TiendaInterface>(`${this.urlApi}/${id}`);
  }
}