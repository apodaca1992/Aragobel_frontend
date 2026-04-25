import { CommonModule } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EntregaDbRepository } from '../../../repository/entrega-db.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { HttpHelper } from '../../../class/http-helper';

import { EntregaService } from '@services/entrega.service'; // Asegura que la ruta sea correcta
import { EntregaInterface } from '@interfaces/entrega-interface';
import { PreferencesService } from '@services/preference.service';

@Component({
  selector: 'app-list-entregas',
  templateUrl: './list-entregas.component.html',
  styleUrls: ['./list-entregas.component.scss'],
})
export class ListEntregasComponent  implements OnInit {
  segmentoActual: string = 'disponibles';
  todasLasEntregas: EntregaInterface[] = []; // Aquí llenas con tu API
 
  idUsuarioActual: string = '';
  idTiendaUsuarioActual: string = '';
  puedeCrear: boolean = false; // Variable booleana para la vista
  esCajero: boolean = false;
  esAdmin: boolean = false;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private _preferencesService: PreferencesService,
    private _entregaService: EntregaService,
  ) {}

  async ngOnInit() {
    this.puedeCrear = await this._preferencesService.tienePermiso('ENTREGAS', 'CREAR');
    this.esAdmin = await this._preferencesService.esAdmin(); // O tu lógica de rol
    this.idUsuarioActual = await this._preferencesService.getIdUser();
    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        this.idTiendaUsuarioActual = user.id_tienda; // O la propiedad que necesites
    }
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

  async cargarDatos() {
    // Aquí llamarías a tu servicio: this.entregaService.getEntregas().subscribe(...)
    // Ejemplo de datos basado en tu tabla SQL:
    const filtros = {
      activo: 1,
      id_tienda: this.idTiendaUsuarioActual,
      fecha_venta: HttpHelper.getFechaLocal(),
      estatus: '!=|3'
    };

    // Llamamos al servicio GET que definimos anteriormente
    this._entregaService.get(filtros).subscribe({
      next: (res:any) => {
        this.todasLasEntregas = res.data;
        console.log('Datos cargados:', res.data);
      },
      error: (err) => {
        this.todasLasEntregas = [];
        console.error('Error al cargar entregas', err);
      }
    });
  
  }

  // El "motor" de las pestañas
  get entregasFiltradas() {

    if (!Array.isArray(this.todasLasEntregas)) {
      return [];
    }
    
    if (this.esCajero) {
      return this.todasLasEntregas.filter(e => e.id_usuario_creador === this.idUsuarioActual);
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
        { type: 'radio', label: 'Moto 01', value: 'VtqPaBh3JxwbLm11tEpm', checked: true },
        { type: 'radio', label: 'Camioneta', value: 'VtqPaBh3JxwbLm11tEpm' }
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

  async asignarEntrega(idEntrega: number | string, idVehiculo: number) {
    // Creamos el objeto para actualizar (Estatus 2 = En tránsito)
    const datosActualizar: any = {
      id: idEntrega,
      id_repartidor: this.idUsuarioActual,
      id_vehiculo: idVehiculo,
      estatus: 2 
    };

    this._entregaService.put(datosActualizar).subscribe({
      next: () => {
        this.cargarDatos(); // Refrescamos la lista
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  async finalizarEntrega(idEntrega: number | string) {
    // Creamos el objeto para actualizar (Estatus 2 = En tránsito)
    const datosActualizar: any = {
      id: idEntrega,
      estatus: 3
    };

    this._entregaService.put(datosActualizar).subscribe({
      next: () => {
        this.cargarDatos(); // Refrescamos la lista
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  irAFormulario() {
    this.router.navigate(['/entregas/form-entregas']);
  }

  async marcarComoEntregado(entrega: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Finalizar Entrega?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Aceptar', 
          handler: () => this.finalizarEntrega(entrega.id) 
        }
      ]
    });
    await alert.present();
  }
}
