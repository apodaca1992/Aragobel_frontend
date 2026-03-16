import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ComponenteInterface } from '@interfaces/componente-interface';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private httpClient: HttpClient) { }

  getMenu(){
    // Creamos el header para que el interceptor lo ignore
    const headers = new HttpHeaders({
      'skipLoading': 'true'
    });
    return this.httpClient.get<ComponenteInterface[]>('/assets/data/menu.json', { headers });
  }
}
