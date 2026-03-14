import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormClass } from '@class/form-class';
import { AuthLoginInterface } from '@interfaces/auth-interface';
import { AuthService } from '@services/auth.service';
import { ToastrService } from 'ngx-toastr';
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
			  try {
				this._preferencesService.setItem('token',res.token);
				
				//let _user = await this.getUserForId(res.id);
				await this._preferencesService.setItem('user',JSON.stringify(res.user));
				await this._preferencesService.setItem('permisos',JSON.stringify(res.permisos));	
				await this._preferencesService.setItem('roles',JSON.stringify(res.user.roles));	

				this.menu.enable(true);
				this._router.navigate(['home']);
			  } catch(err: any) {									
				console.log("se produjo un error en el login1");
				console.log(this.messageError(err));
				this.toastService.show(this.messageError(err));
			  }
			},
			error: (err:HttpErrorResponse) => {	
				console.log("se produjo un error en el login2");
				console.log(this.messageError(err));
			  this.toastService.show(this.messageError(err));
			}
		});	 
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
