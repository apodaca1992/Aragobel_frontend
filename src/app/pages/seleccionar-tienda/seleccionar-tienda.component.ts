import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from '@services/preference.service';
import { MenuController } from '@ionic/angular';
import { TiendaService } from '@services/tienda.service';


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
  		private menu: MenuController,
		private _tiendaService  : TiendaService
	) {}

	async ngOnInit() {
		// Leemos el array que ya trae ID y Nombre
		const tiendasStr = await this._preferencesService.getItem('tiendas_asignadas');
		this.tiendas = JSON.parse(tiendasStr ?? '[]');
	}

	async seleccionar(tienda: any) {
		// 1. Consultamos los datos faltantes de la tienda seleccionada
        this._tiendaService.getById(tienda.id_tienda).subscribe({
            next: async (resTienda: any) => {
                if (resTienda.data) {
                    const config = resTienda.data.configuracion_asistencia;

                    // 2. Recuperamos los datos de sesión actuales
                    const userStr = await this._preferencesService.getItem('user');
                    const permisosStr = await this._preferencesService.getItem('permisos');
                    const empresaStr = await this._preferencesService.getItem('empresa');

                    const user = JSON.parse(userStr ?? '{}');
                    const permisos = JSON.parse(permisosStr ?? '{}');
                    const empresaData = JSON.parse(empresaStr ?? '{}');
                    const modulosEmpresa = empresaData.modulos ?? { checador: true, entregas: true };

                    // 3. Armamos el objeto usuario con la tienda y sus horarios
                    user.id_tienda = tienda.id_tienda;
					user.nombre_tienda = tienda.nombre; 
                    user.configuracion_asistencia = {
                        apertura: config.hora_apertura,
                        cierre: config.hora_cierre,
                        tolerancia: config.tolerancia_minutos,
                        timezone: config.time_zone
                    };

                    // 4. Guardamos todo y habilitamos el menú
                    await this._preferencesService.setItem('user', JSON.stringify(user));
                    await this.menu.enable(true, 'MenuPrincipal');

                    // 5. Redireccionamos
                    this.redireccionarUsuario(user.roles || [], permisos, modulosEmpresa);
                }
            },
            error: (err) => {
                console.error('Error al obtener detalles de la tienda:', err);
                // Aquí podrías mostrar un toast de error si la red falla
            }
        });
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
