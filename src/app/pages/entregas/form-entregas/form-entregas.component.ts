import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-entregas',
  templateUrl: './form-entregas.component.html',
  styleUrls: ['./form-entregas.component.scss'],
})
export class FormEntregasComponent  implements OnInit {

  // Objeto con la estructura que pediste
  entrega: any = {
    id: null, //1
    folio: '',
    persona_recibe: '',
    colonia: '',
    estatus: 1,
    id_repartidor: null,
    id_vehiculo: null,
    id_usuario_creador: 1 // Hardcodeado por ahora
  };

  // Datos simulados para los selects
  repartidores = [
    { id: 10, nombre: 'Juan Pérez' },
    { id: 11, nombre: 'Marcos Ruiz' }
  ];

  vehiculos = [
    { id: 1, placa: 'VNK-90-21', modelo: 'Nissan NP300' },
    { id: 2, placa: 'UL-12-88', modelo: 'Hilux' }
  ];

  constructor() { }

  ngOnInit() {
    // Si estuviéramos editando, aquí recibiríamos el objeto y lo asignaríamos
    // this.entrega = ... datos de la entrega seleccionada
  }

  guardar() {
    console.log('Datos a enviar a Node.js:', this.entrega);
    // Aquí iría tu servicio: this.entregaService.save(this.entrega);
  }

}
