import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private prefijo : string = `${environment.prefijoLocalStorage}`;

  constructor(    
  ) { }

  getItem(key: string) : string | null{
    return localStorage.getItem(this.prefijo+'.'+key);
  }

  setItem(key: string, value : string) : void{
    localStorage.setItem(this.prefijo+'.'+key, value);
  }

  clearSession(): void {
    localStorage.clear();
  }
}
