import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { ColoniaInterface } from '@interfaces/colonia-interface';
import { HttpHelper } from '../class/http-helper';

@Injectable({
  providedIn: 'root',
})
export class ColoniaService {
  private urlApi : string = `${environment.API}/colonias`;

  constructor(    
    private _httpClient : HttpClient
  ) { }
  
  get(params?: any): Observable<ColoniaInterface[]> {
    return this._httpClient.get<ColoniaInterface[]>(`${this.urlApi}`,{ params: HttpHelper.convertToHttpParams(params) } );
  }
  getById(id: string | number): Observable<ColoniaInterface> {
    return this._httpClient.get<ColoniaInterface>(`${this.urlApi}/${id}`);
  }
  post(params: ColoniaInterface): Observable<ColoniaInterface> {
    return this._httpClient.post<ColoniaInterface>(`${this.urlApi}`, params);
  }
  put(params: ColoniaInterface): Observable<ColoniaInterface> {
    let id : string | number = params.id || '';
    return this._httpClient.put<ColoniaInterface>(`${this.urlApi}/${id}`, params);
  }
  delete(id: string | number): Observable<ColoniaInterface> {
    return this._httpClient.delete<ColoniaInterface>(`${this.urlApi}/${id}`);
  }
}