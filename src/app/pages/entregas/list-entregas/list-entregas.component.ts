import { CommonModule } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EntregaDbRepository } from '../../../repository/entrega-db.service';
import { Entrega } from '@interfaces/entrega-interface'; 
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { PreferencesService } from '@services/preference.service';

@Component({
  selector: 'app-list-entregas',
  templateUrl: './list-entregas.component.html',
  styleUrls: ['./list-entregas.component.scss'],
})
export class ListEntregasComponent  implements OnInit {
  segmentoActual: string = 'disponibles';
  todasLasEntregas: any[] = []; // Aquí llenas con tu API
 
  idUsuarioActual: string = '';
  puedeCrear: boolean = false; // Variable booleana para la vista
  esCajero: boolean = false;
  esAdmin: boolean = false;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private _preferencesService: PreferencesService,
  ) {}

  async ngOnInit() {
    this.puedeCrear = await this._preferencesService.tienePermiso('ENTREGAS', 'CREAR');
    this.esAdmin = await this._preferencesService.esAdmin(); // O tu lógica de rol
    this.idUsuarioActual = await this._preferencesService.getIdUser();
    this.esCajero = this.puedeCrear;
    // 3. Definimos qué pestaña mostrar por defecto al entrar
    if (this.puedeCrear && !this.esAdmin) { //!this.esAdmin
      this.esCajero = true;
      this.segmentoActual = 'mis-registros';
    } else {
      this.esCajero = false;
      this.segmentoActual = 'disponibles';
    }
    this.cargarDatos();
  }

  cargarDatos() {
    // Aquí llamarías a tu servicio: this.entregaService.getEntregas().subscribe(...)
    // Ejemplo de datos basado en tu tabla SQL:
    this.todasLasEntregas = [
      { id: 1, folio: 'A-101', persona_recibe: 'Adrian', colonia: 'Centro', estatus: 1, id_repartidor: null , id_usuario_creador: 1},
      { id: 2, folio: 'A-102', persona_recibe: 'Adrian2', colonia: 'Centro', estatus: 1, id_repartidor: null , id_usuario_creador: 1},
      { id: 3, folio: 'A-103', persona_recibe: 'Adrian3', colonia: 'Centro', estatus: 1, id_repartidor: null , id_usuario_creador: 1},
      { id: 4, folio: 'A-104', persona_recibe: 'Adrian4', colonia: 'Centro', estatus: 1, id_repartidor: null , id_usuario_creador: 1},
      { id: 5, folio: 'A-105', persona_recibe: 'Jesus', colonia: 'Industrial', estatus: 2, id_repartidor: 1 , id_usuario_creador: 1},
      { id: 6, folio: 'A-106', persona_recibe: 'Jesus1', colonia: 'Industrial', estatus: 2, id_repartidor: 1 , id_usuario_creador: 1},
      { id: 7, folio: 'A-107', persona_recibe: 'Jesus2', colonia: 'Industrial', estatus: 3, id_repartidor: 1 , id_usuario_creador: 'blIL9Ts6MeEbubvhnVpP'},
      { id: 8, folio: 'A-108', persona_recibe: 'Jesus3', colonia: 'Industrial', estatus: 1, id_repartidor: null , id_usuario_creador: 'blIL9Ts6MeEbubvhnVpP'},
      { id: 9, folio: 'A-109', persona_recibe: 'Jesus4', colonia: 'Industrial', estatus: 2, id_repartidor: 1 , id_usuario_creador: 'blIL9Ts6MeEbubvhnVpP'},
      { id: 9, folio: 'A-110', persona_recibe: 'Jesus5', colonia: 'Industrial2', estatus: 2, id_repartidor: 2, id_usuario_creador: 'blIL9Ts6MeEbubvhnVpP'}
    ];
  }

  // El "motor" de las pestañas
  get entregasFiltradas() {
    if (this.esCajero) {
      return this.todasLasEntregas.filter(e => {
        // Filtro 1: Que el creador sea él mismo
        const esMio = e.id_usuario_creador === this.idUsuarioActual;
        
        return esMio ;
      });
    }


    if (this.segmentoActual === 'disponibles') {
      return this.todasLasEntregas.filter(e => e.estatus === 1);
    } else {
      if (this.esAdmin) {
        return this.todasLasEntregas.filter(e => e.estatus === 2);
      }
      return this.todasLasEntregas.filter(e => e.estatus === 2 && e.id_repartidor === this.idUsuarioActual);
    }
  }

  async abrirSelectorVehiculo(entrega: any) {
    const alert = await this.alertCtrl.create({
      header: 'Seleccionar Vehículo',
      inputs: [
        { type: 'radio', label: 'Moto 01', value: 1, checked: true },
        { type: 'radio', label: 'Camioneta', value: 2 }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Confirmar Salida', 
          handler: (idVehiculo) => this.asignarEntrega(entrega.id, idVehiculo) 
        }
      ]
    });
    await alert.present();
  }

  asignarEntrega(idEntrega: number, idVehiculo: number) {
    console.log('Asignando a repartidor:', this.idUsuarioActual, 'Vehiculo:', idVehiculo);
    // Llamar a API -> UPDATE entregas SET id_repartidor = ?, id_vehiculo = ?, estatus = 2...
  }

  irAFormulario() {
    this.router.navigate(['/entregas/form-entregas']);
  }

  marcarComoEntregado(datos: any) {
    this.router.navigate(['/entregas/form-entregas']);
  }
}
