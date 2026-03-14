import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthInterface, AuthLoginInterface } from '@interfaces/auth-interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private urlApi : string = `${environment.API}/auth`;

  constructor(    
    private _httpClient : HttpClient
  ) { }

  login(params : AuthLoginInterface) : Observable<AuthInterface>{
    return this._httpClient.post<AuthInterface>(`${this.urlApi}/login`, params);
  }
}