import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from '@services/preference.service';
import { MenuController } from '@ionic/angular';


@Component({
  selector: 'app-seleccionar-tienda',
  templateUrl: './seleccionar-tienda.component.html',
  styleUrls: ['./seleccionar-tienda.component.scss'],
})
export class SeleccionarTiendaComponent implements OnInit {

  tiendas: any[] = [];

	constructor(		
		private _preferencesService: PreferencesService,
    	private _router: Router,
  		private menu: MenuController
	) {}

	async ngOnInit() {
		// Leemos el array que ya trae ID y Nombre
		const tiendasStr = await this._preferencesService.getItem('tiendas_asignadas');
		this.tiendas = JSON.parse(tiendasStr ?? '[]');
	}

	async seleccionar(tienda: any) {
		const userStr = await this._preferencesService.getItem('user');
		const permisosStr = await this._preferencesService.getItem('permisos');
    	const empresaStr = await this._preferencesService.getItem('empresa');

		const user = JSON.parse(userStr ?? '{}');
		const permisos = JSON.parse(permisosStr ?? '{}');
    	const modulosEmpresa = JSON.parse(empresaStr ?? '{}');
		
		// Guardamos la elección
		user.id_tienda = tienda.id_tienda;
		user.nombre_tienda = tienda.nombre; 

		await this._preferencesService.setItem('user', JSON.stringify(user));

		// --- EL CAMBIO CLAVE AQUÍ ---
		await this.menu.enable(true, 'MenuPrincipal'); // Ahora sí, abrimos el menú
		// ----------------------------
		
		// 4. Ejecutamos la redirección inteligente
    	this.redireccionarUsuario(user.roles || [], permisos, modulosEmpresa);
	}

	private redireccionarUsuario(roles: string[], permisos: any, configEmpresa: any) {
		// 1. Prioridad: ADMINISTRADOR
		if (roles.includes('ADMINISTRADOR')) {
		this._router.navigate(['/panel-admin']);
		return;
		}

		// 2. Operación: Checador
		if (configEmpresa.checador !== false && permisos['CHECADOR']) {
		this._router.navigate(['/checador']);
		return;
		}

		// 3. Operación: Mis Entregas
		if (configEmpresa.entregas !== false && permisos['ENTREGAS']) {
		this._router.navigate(['/entregas']);
		return;
		}

		// 4. Comodín
		this._router.navigate(['/perfil']);
	}
}
