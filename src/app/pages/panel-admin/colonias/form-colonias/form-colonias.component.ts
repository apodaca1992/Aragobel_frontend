import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-form-colonias',
  templateUrl: './form-colonias.component.html',
  styleUrls: ['./form-colonias.component.scss'],
})
export class FormColoniasComponent implements OnInit {

  esEdicion: boolean = false;
  coloniaId!: number;
  
  // Modelo del objeto (solo almacena el nombre)
  colonia: any = {
    nombre: ''
  };

  // BD Mock idéntica a la pantalla de lista para simular la búsqueda en edición
  private listaColoniasMock: any[] = [
    { id: 1, nombre: 'Centro Histórico' },
    { id: 2, nombre: 'Las Quintas' },
    { id: 3, nombre: 'Tres Ríos' },
    { id: 4, nombre: 'Infonavit Humaya' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    // Detectamos si viene un parámetro 'id' en la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.esEdicion = true;
      this.coloniaId = parseInt(idParam, 10);
      this.cargarColonia(this.coloniaId);
    }
  }

  // Simula la consulta a la base de datos por ID
  cargarColonia(id: number) {
    const coloniaEncontrada = this.listaColoniasMock.find(c => c.id === id);
    if (coloniaEncontrada) {
      // Clonamos el objeto para no alterar el mock directo en memoria de golpe
      this.colonia = { ...coloniaEncontrada };
    } else {
      this.mostrarToast('La colonia no existe.', 'danger');
      this.router.navigate(['/panel-admin/colonias']);
    }
  }

  // Acción principal del formulario
  async guardarColonia() {
    if (!this.colonia.nombre || this.colonia.nombre.trim() === '') return;

    if (this.esEdicion) {
      // LOGICA DE EDICIÓN (API PUT)
      console.log('Actualizando Colonia ID:', this.coloniaId, 'Nuevo Nombre:', this.colonia.nombre);
      await this.mostrarToast('Colonia actualizada correctamente.', 'success');
    } else {
      // LOGICA DE CREACIÓN (API POST)
      console.log('Insertando nueva colonia:', this.colonia.nombre);
      await this.mostrarToast('Colonia registrada con éxito.', 'success');
    }

    // Redirigimos de vuelta al catálogo
    this.router.navigate(['/panel-admin/colonias']);
  }

  cancelar() {
    this.router.navigate(['/panel-admin/colonias']);
  }

  // Helper UX para notificaciones flotantes sencillas
  async mostrarToast(mensaje: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
}