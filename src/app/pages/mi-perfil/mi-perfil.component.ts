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
    // 1. Jalamos los datos del usuario como ya lo hacías
    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
      this.usuario = JSON.parse(userStr);
    }

    // 2. Jalamos los datos de la Empresa de su propia llave de almacenamiento
    const empresaStr = await this._preferencesService.getItem('empresa');
    if (empresaStr && this.usuario) {
      const empresaData = JSON.parse(empresaStr);
      // Le inyectamos el nombre de la empresa directamente a nuestro objeto usuario en memoria
      this.usuario.nombre_empresa = empresaData.nombre; // Guardará "QA"
    }

    // 3. Jalamos los datos de las Tiendas de su propia llave
    const tiendasStr = await this._preferencesService.getItem('tiendas_asignadas');
    if (tiendasStr && this.usuario) {
      const tiendasData = JSON.parse(tiendasStr);
      // Como vemos en tu captura que es un arreglo [ { ... } ], tomamos la primera asignada
      if (tiendasData && tiendasData.length > 0) {
        this.usuario.nombre_tienda = tiendasData[0].nombre; // Guarda el nombre de la tienda
      }
    }

    console.log('Datos del perfil unificados:', this.usuario);
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
