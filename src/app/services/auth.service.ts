import { Injectable, EventEmitter, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { AuthInterface, AuthLoginInterface } from '@interfaces/auth-interface';
import { PreferencesService } from '@services/preference.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Inyecciones modernas mediante la función inject
  private router = inject(Router);
  private preferenceService = inject(PreferencesService);

  // Este evento avisará a otros componentes que el login cambió
  public loginStatus$ = new EventEmitter<boolean>();
  private urlApi : string = `${environment.API}/auth`;

  constructor(    
    private _httpClient : HttpClient
  ) { }

  login(params : AuthLoginInterface) : Observable<AuthInterface>{
    return this._httpClient.post<AuthInterface>(`${this.urlApi}/login`, params);
  }


  /**
   * Centraliza la redirección inteligente basada en los roles,
   * permisos y módulos activos de la sesión actual.
   */
  async redireccionarSegunPerfil(): Promise<void> {
    const userRaw = await this.preferenceService.getItem('user');
    const permisosRaw = await this.preferenceService.getItem('permisos');
    const empresaRaw = await this.preferenceService.getItem('empresa');

    // Si por alguna razón se intenta ejecutar sin datos, va al login
    if (!userRaw) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    const userData = JSON.parse(userRaw);

    // 1. Si no tiene una tienda activa asignada (caso de múltiples tiendas al loguearse)
    if (!userData.id_tienda || userData.id_tienda === '') {
      this.router.navigateByUrl('/seleccionar-tienda', { replaceUrl: true });
      return;
    }

    // 2. Extraemos configuraciones si ya cuenta con una tienda activa
    const roles: string[] = userData.roles || [];
    const permisos = permisosRaw ? JSON.parse(permisosRaw) : {};
    const empresa = empresaRaw ? JSON.parse(empresaRaw) : {};
    const configModulos = empresa.modulos || {};

    // Prioridad A: ADMINISTRADOR
    if (roles.includes('ADMINISTRADOR')) {
      this.router.navigateByUrl('/panel-admin', { replaceUrl: true });
      return;
    }

    // Prioridad B: Checador (Permiso y módulo activo)
    if (configModulos.checador !== false && permisos['CHECADOR']) {
      this.router.navigateByUrl('/checador', { replaceUrl: true });
      return;
    }

    // Prioridad C: Mis Entregas (Permiso y módulo activo)
    if (configModulos.entregas !== false && permisos['ENTREGAS']) {
      this.router.navigateByUrl('/entregas', { replaceUrl: true });
      return;
    }

    // Comodín por defecto en caso de no cumplir con las prioridades
    this.router.navigateByUrl('/perfil', { replaceUrl: true });
  }
}