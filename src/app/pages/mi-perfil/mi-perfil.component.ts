import { Component, OnInit, ViewChild } from '@angular/core';
import { IonList } from '@ionic/angular';
import { PreferencesService } from '@services/preference.service';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss'],
})
export class MiPerfilComponent  implements OnInit {
  usuario: any = null;

  @ViewChild(IonList) ionList!: IonList;

  constructor(private _preferencesService: PreferencesService) { }

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


}
