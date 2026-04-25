import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { EntregaInterface } from '@interfaces/entrega-interface';
import { HttpHelper } from '../class/http-helper';

@Injectable({
  providedIn: 'root',
})
export class EntregaService {
  private urlApi : string = `${environment.API}/entregas`;

  constructor(    
    private _httpClient : HttpClient
  ) { }
  
  get(params?: any): Observable<EntregaInterface[]> {
    return this._httpClient.get<EntregaInterface[]>(`${this.urlApi}`,{ params: HttpHelper.convertToHttpParams(params) } );
  }
  getById(id: string | number): Observable<EntregaInterface> {
    return this._httpClient.get<EntregaInterface>(`${this.urlApi}/${id}`);
  }
  post(params: EntregaInterface): Observable<EntregaInterface> {
    return this._httpClient.post<EntregaInterface>(`${this.urlApi}`, params);
  }
  put(params: EntregaInterface): Observable<EntregaInterface> {
    let id : string | number = params.id || '';
    return this._httpClient.put<EntregaInterface>(`${this.urlApi}/${id}`, params);
  }
  delete(id: string | number): Observable<EntregaInterface> {
    return this._httpClient.delete<EntregaInterface>(`${this.urlApi}/${id}`);
  }
}