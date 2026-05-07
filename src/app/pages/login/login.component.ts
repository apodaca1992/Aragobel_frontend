import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormClass } from '@class/form-class';
import { AuthLoginInterface } from '@interfaces/auth-interface';
import { AuthService } from '@services/auth.service';
import { Location } from '@angular/common';
//import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { ToastService } from '@services/toast.service';
import { PreferencesService } from '@services/preference.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends FormClass implements OnInit {

  //frmLogin!: UntypedFormGroup;
	
	frmLogin    : FormGroup = new FormGroup({
		usuario   : new FormControl('', [
		  Validators.required,
		  // Validators.minLength(6),
		  // Validators.maxLength(45),
		]),
		contrasena: new FormControl('', [
		  Validators.required,
		  // Validators.minLength(6),
		  // Validators.maxLength(50),
		  // Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{6,50}$/)
		]),
	});

	constructor(		
		private toastService: ToastService,
		private _authService  : AuthService,
		//private _userService  : UserService,
		private _preferencesService: PreferencesService,
		private _location : Location,
		public _router: Router,
		//private _recaptchaV3Service: ReCaptchaV3Service,
		private menu: MenuController) {
		super();
	  }

	ngOnInit(): void {
	}

	login(): void{
  
		if(this.frmLogin.invalid){
			this.markTouchedForm(this.frmLogin);
			return;
		}

		this._authService.login({...this.frmLogin.getRawValue()} as AuthLoginInterface).subscribe({
			next : async res => {
			  	await this.saveSession(res);

				// 1. Verificamos si tiene múltiples tiendas
                // Asumiendo que res.user.tiendas_asignadas es el array de IDs o nombres
                const tiendas = res.user.tiendas_asignadas || [];

                if (tiendas.length > 1) {
                    // Si tiene más de una, lo mandamos a elegir
                    this._router.navigate(['/seleccionar-tienda']);
                } else if (tiendas.length === 1) {
					// Si solo tiene una, la asignamos de una vez como activa
					const user = res.user;
					user.id_tienda = tiendas[0].id_tienda;
					user.nombre_tienda = tiendas[0].nombre;
					await this._preferencesService.setItem('user', JSON.stringify(user));
					
                    const roles = res.user.roles || [];
                    const permisos = res.permisos || {};
                    const configEmpresa = res.empresa || {};
                    this.redireccionarUsuario(roles, permisos, configEmpresa.modulos);
                }else {
					// Sin tiendas asignadas
					this._router.navigate(['/perfil']);
				}
			}
		});	 
	}

	private redireccionarUsuario(roles: string[], permisos: any, configEmpresa: any) {	
		// 1. Prioridad: ADMINISTRADOR
		if (roles.includes('ADMINISTRADOR')) {
			this._router.navigate(['/panel-admin']);
			return;
		}

		// 2. Operación: Checador (Si la empresa lo tiene activo Y el usuario tiene permiso)
		// Nota: Usamos !== false por si el campo es undefined (asumimos true)
		if (configEmpresa.checador !== false && permisos['CHECADOR']) {
			this._router.navigate(['/checador']);
			return;
		}

		// 3. Operación: Mis Entregas (Si el checador está apagado pero entregas no)
		if (configEmpresa.entregas !== false && permisos['ENTREGAS']) {
			this._router.navigate(['/entregas']);
			return;
		}

		// 4. Comodín: Si no tiene nada de lo anterior, mándalo al Perfil o Home
		this._router.navigate(['/perfil']); 
	}

	private async saveSession(res: any) {
		// Centraliza el guardado para evitar errores de escritura
		await Promise.all([
			this._preferencesService.setItem('token',res.token),			
			//let _user = await this.getUserForId(res.id);
			this._preferencesService.setItem('user',JSON.stringify(res.user)),
			this._preferencesService.setItem('permisos',JSON.stringify(res.permisos)),
			this._preferencesService.setItem('roles',JSON.stringify(res.user.roles)),	
			this._preferencesService.setItem('empresa',JSON.stringify(res.empresa)),	
			this._preferencesService.setItem('tiendas_asignadas',JSON.stringify(res.user.tiendas_asignadas)),
		]);
		
		if (res.user.tiendas_asignadas.length <= 1) {
			await this.menu.enable(true, 'MenuPrincipal');
		} else {
			await this.menu.enable(false, 'MenuPrincipal'); // Aseguramos que esté apagado
		}
		// 2. DISPARAMOS EL EVENTO (Esto es lo que quita la necesidad del F5)
    	this._authService.loginStatus$.emit(true);
	}

	/*async getUserForId(id: number){  
		return new Promise((resolve, reject) => {
		  this._userService.getById(id).subscribe({
			next : res => {    
			  resolve(res);      
			},
			error: (err:HttpErrorResponse) => {   
			  reject(err); 
			}          
		  }); 
		});
	}*/

}
