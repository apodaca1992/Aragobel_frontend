import { Component, OnInit } from '@angular/core';
import { ComponenteInterface } from '@interfaces/componente-interface';
import { MenuController, NavController } from '@ionic/angular';
import { MenuService } from '@services/menu.service';
import { Observable, from, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PreferencesService } from '@services/preference.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  appPages!: Observable<ComponenteInterface[]>;
  public isAdmin: boolean = false;
  public nombreEmpresa: string = '';
    
  constructor(
    private menuService: MenuService,
    private _authService  : AuthService,
    private menu: MenuController,
    private _preferencesService: PreferencesService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    // 1. Cargamos el menú la primera vez
    this.cargarConfiguracionMenu();

    // 2. Nos suscribimos al evento de login para recargar SIN F5
    this._authService.loginStatus$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.cargarConfiguracionMenu();
      }
    });
  }

  cargarConfiguracionMenu() {
    this.appPages = forkJoin({
      permisosStr: from(this._preferencesService.getItem('permisos')),
      rolesStr: from(this._preferencesService.getItem('roles')),
      empresaStr: from(this._preferencesService.getItem('empresa'))
    }).pipe(
      switchMap(({ permisosStr, rolesStr, empresaStr }) => {
        const permisos = permisosStr ? JSON.parse(permisosStr as string) : {};
        const roles = rolesStr ? JSON.parse(rolesStr as string) : [];
        const empresaData = empresaStr ? JSON.parse(empresaStr as string) : null;

        // Asignamos el nombre de la empresa (con un fallback por si no existe)
        this.nombreEmpresa = empresaData?.nombre ?? '';

        const configModulos = empresaData?.modulos ?? { checador: true, entregas: true };
        
        this.isAdmin = roles.includes('ADMINISTRADOR');

        return this.menuService.getMenu().pipe(
          map(items => this.filtrarMenu(items, roles, permisos, configModulos))
        );
      })
    );
  }

  private filtrarMenu(items: ComponenteInterface[], roles: string[], permisos: any, moduloEmpresa: any): ComponenteInterface[] {
    return items.filter(item => {
      console.log(`Evaluando ${item.name}: requiere ${item.permisoRequerido}`);

      // 1. Si no requiere permiso específico (ej: Inicio, Mi Perfil), se muestra siempre
      if (!item.permisoRequerido) return true;

      // Una vez pasada la validación de arriba, TypeScript sabe con certeza que es un string.
      const moduloKey = item.permisoRequerido.toUpperCase();

      // --- VALIDACIÓN DE MÓDULOS DE EMPRESA ---
      // Usamos el string original en minúsculas/camelCase para el objeto de configuración de la empresa
      if (moduloEmpresa && moduloEmpresa[item.permisoRequerido] === false) {
        return false;
      }

      // 2. Si es ADMINISTRADOR, tiene permiso total
      if (roles.includes('ADMINISTRADOR')) return true;

      // --- VALIDACIÓN DE LA NUEVA ESTRUCTURA DE PERMISOS ---
      // Buscamos en el mapa usando la llave formateada en mayúsculas (ej: 'CHECADOR')
      const pModulo = permisos[moduloKey];
      
      // Validamos que el nodo exista y contenga el arreglo 'acciones_modulo'
      if (pModulo && pModulo.acciones_modulo) {
        return pModulo.acciones_modulo.includes('LISTAR') || pModulo.acciones_modulo.includes('VER');
      }

      return false;
    });
  }

  /*async cerrarSesion() {
    await this._preferencesService.clearSession();
    this.isAdmin = false; 
    this.appPages = from([]); 
    await this.menu.enable(false, 'MenuPrincipal'); 
    await this.menu.close('MenuPrincipal');
    
    this.navCtrl.navigateRoot('/login', {
      animated: true,
      animationDirection: 'back'
    });
  }*/
}