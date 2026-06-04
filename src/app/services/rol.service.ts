import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { RolInterface } from '@interfaces/rol-interface';
import { HttpHelper } from '../class/http-helper';

@Injectable({
  providedIn: 'root',
})
export class RolService {
  private urlApi : string = `${environment.API}/roles`;

  constructor(    
    private _httpClient : HttpClient
  ) { }
  
  get(params?: any): Observable<RolInterface[]> {
    return this._httpClient.get<RolInterface[]>(`${this.urlApi}`,{ params: HttpHelper.convertToHttpParams(params) } );
  }
  getById(id: string | number): Observable<RolInterface> {
    return this._httpClient.get<RolInterface>(`${this.urlApi}/${id}`);
  }
  post(params: RolInterface): Observable<RolInterface> {
    return this._httpClient.post<RolInterface>(`${this.urlApi}`, params);
  }
  put(params: RolInterface): Observable<RolInterface> {
    let id : string | number = params.id || '';
    return this._httpClient.put<RolInterface>(`${this.urlApi}/${id}`, params);
  }
  delete(id: string | number): Observable<RolInterface> {
    return this._httpClient.delete<RolInterface>(`${this.urlApi}/${id}`);
  }
}