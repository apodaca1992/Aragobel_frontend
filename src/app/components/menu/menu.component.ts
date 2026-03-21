import { Component, OnInit } from '@angular/core';
import { ComponenteInterface } from '@interfaces/componente-interface';
import { MenuController, NavController } from '@ionic/angular';
import { MenuService } from '@services/menu.service';
import { Observable, from, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'; // Añadimos operadores
import { PreferencesService } from '@services/preference.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  // Ya no necesitamos selectedIndex
  appPages!: Observable<ComponenteInterface[]>;
  public isAdmin: boolean = false;
    
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
      rolesStr: from(this._preferencesService.getItem('roles'))
    }).pipe(
      switchMap(({ permisosStr, rolesStr }) => {
        const permisos = permisosStr ? JSON.parse(permisosStr as string) : {};
        const roles = rolesStr ? JSON.parse(rolesStr as string) : [];
        
        this.isAdmin = roles.includes('ADMINISTRADOR');

        return this.menuService.getMenu().pipe(
          map(items => this.filtrarMenu(items, roles, permisos))
        );
      })
    );
  }

  private filtrarMenu(items: ComponenteInterface[], roles: string[], permisos: any): ComponenteInterface[] {
    return items.filter(item => {
      console.log(`Evaluando ${item.name}: requiere ${item.permisoRequerido}`);
      // 1. Si es ADMINISTRADOR, tiene permiso total
      if (roles.includes('ADMINISTRADOR')) return true;

      // 2. Si no requiere permiso específico (ej: Inicio, Mi Perfil), se muestra
      if (!item.permisoRequerido) return true;

      // 3. Verificar si el módulo existe en sus permisos y tiene nivel "LISTAR" o "VER"
      const pModulo = permisos[item.permisoRequerido];
      return pModulo && (pModulo.includes('LISTAR') || pModulo.includes('VER'));
    });
  }

  async cerrarSesion() {
    await this._preferencesService.clearSession();
    this.isAdmin = false; // Resetear bandera
    this.appPages = from([]); // Limpiar menú visualmente
    await this.menu.enable(false, 'MenuPrincipal'); // Deshabilitar específicamente este menú
    await this.menu.close('MenuPrincipal');
    
    this.navCtrl.navigateRoot('/login', {
      animated: true,
      animationDirection: 'back'
    });
  }
}