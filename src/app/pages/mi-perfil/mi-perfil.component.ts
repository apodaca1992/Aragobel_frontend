import { Component, OnInit, ViewChild } from '@angular/core';
import { IonList } from '@ionic/angular';
import { PreferencesService } from '@services/preference.service';
import { MenuController, NavController } from '@ionic/angular';
import { AlertService } from '@services/alert.service';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss'],
})
export class MiPerfilComponent  implements OnInit {
  usuario: any = null;

  @ViewChild(IonList) ionList!: IonList;

  constructor(
    private _alertService: AlertService,
    private menu: MenuController,
    private _preferencesService: PreferencesService,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
      this.usuario = JSON.parse(userStr);
      console.log('Datos del perfil:', this.usuario);
    }
  }

  // Opcional: Función para formatear el nombre
  get nombreCompleto() {
    if (!this.usuario) return 'Cargando...';
    return `${this.usuario.nombre} ${this.usuario.apellido_paterno} ${this.usuario.apellido_materno}`;
  }

  // Ventana de confirmación nativa estilo premium
  confirmarCerrarSesion() {
    this._alertService.confirm(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir del sistema?',
      () => {
        // Este callback es el "confirmHandler" que se ejecuta al presionar Aceptar
        this.ejecutarCerrarSesion();
      }
    );
  }

  // Tu lógica original migrada y sincronizada con el estado del menú
  async ejecutarCerrarSesion() {
    // 1. Limpiamos la sesión en el almacenamiento local
    await this._preferencesService.clearSession();
    
    // 2. Apagamos y cerramos el menú lateral por su ID único
    await this.menu.enable(false, 'MenuPrincipal');
    await this.menu.close('MenuPrincipal');
    
    // 3. Redireccionamos limpiando el histórico
    this.navCtrl.navigateRoot('/login', {
      animated: true,
      animationDirection: 'back'
    });
  }



}
