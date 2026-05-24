import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from '@services/preference.service';
import { MenuController } from '@ionic/angular';
import { TiendaService } from '@services/tienda.service';
import { AuthService } from '@services/auth.service';


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
		private _tiendaService  : TiendaService,
		private _authService  : AuthService
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

                    const user = JSON.parse(userStr ?? '{}');

                    // 3. Armamos el objeto usuario con la tienda y sus horarios
                    user.id_tienda = tienda.id_tienda;
					user.nombre_tienda = tienda.nombre; 
					user.jornada_efectiva = tienda.jornada_efectiva;
					user.tiempo_comida_max = tienda.tiempo_comida_max;
                    user.tienda_activa_config = {
                        apertura: config.hora_apertura,
                        cierre: config.hora_cierre,
                        tolerancia: config.tolerancia_minutos,
                        timezone: config.time_zone
                    };

                    // 4. Guardamos todo y habilitamos el menú
                    await this._preferencesService.setItem('user', JSON.stringify(user));
                    await this.menu.enable(true, 'MenuPrincipal');

                    // 5. Redireccionamos
                    this._authService.redireccionarSegunPerfil();
                }
            },
            error: (err) => {
                console.error('Error al obtener detalles de la tienda:', err);
                // Aquí podrías mostrar un toast de error si la red falla
            }
        });
	}	
}
