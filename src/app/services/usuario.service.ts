import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { UsuarioInterface } from '@interfaces/usuario-interface';
import { HttpHelper } from '../class/http-helper';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private urlApi : string = `${environment.API}/usuarios`;

  constructor(    
    private _httpClient : HttpClient
  ) { }
  
  get(params?: any): Observable<UsuarioInterface[]> {
    return this._httpClient.get<UsuarioInterface[]>(`${this.urlApi}`,{ params: HttpHelper.convertToHttpParams(params) } );
  }
  getById(id: string | number): Observable<UsuarioInterface> {
    return this._httpClient.get<UsuarioInterface>(`${this.urlApi}/${id}`);
  }
  post(params: UsuarioInterface): Observable<UsuarioInterface> {
    return this._httpClient.post<UsuarioInterface>(`${this.urlApi}`, params);
  }
  put(params: UsuarioInterface): Observable<UsuarioInterface> {
    let id : string | number = params.id || '';
    return this._httpClient.put<UsuarioInterface>(`${this.urlApi}/${id}`, params);
  }
  delete(id: string | number): Observable<UsuarioInterface> {
    return this._httpClient.delete<UsuarioInterface>(`${this.urlApi}/${id}`);
  }
}