import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ComponenteInterface } from '@interfaces/componente-interface';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private httpClient: HttpClient) { }

  getMenu(){
    return this.httpClient.get<ComponenteInterface[]>('/assets/data/menu.json');
  }
}
