import { CommonModule } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EntregaDbRepository } from '../../../repository/entrega-db.service';
import { Entrega } from '@interfaces/entrega-interface'; 

@Component({
  selector: 'app-list-entregas',
  templateUrl: './list-entregas.component.html',
  styleUrls: ['./list-entregas.component.scss'],
})
export class ListEntregasComponent  implements OnInit {
  entregas = this.entregaDbRepository.entregas;
  newCategoryName = '';

  constructor(private entregaDbRepository: EntregaDbRepository) { 
    effect(() => {
      console.log('CATEGORIES CHANGED ', this.entregas);
    })
  }

  async ngOnInit() {
    // Importante: Cargamos los datos al iniciar la página
    await this.entregaDbRepository.loadAll();
  }

  async createCategory() {
    if (!this.newCategoryName.trim()) return;

    const ENTREGA_MOCK: Entrega = {
      id_entrega: crypto.randomUUID(),
      folio: this.newCategoryName.trim(),
      id_repartidor: 'a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5',
      id_vehiculo: 'v9876543-21ba-4321-cba9-876543210fed',
      colonia: 'Centro Histórico',
      fec_registropedido: '2026-03-21T08:30:00Z',
      fec_salidapedido: '2026-03-21T09:15:00Z',
      fec_entregapedido: '2026-03-21T10:05:00Z',
      id_tienda: 't1122334-4455-6677-8899-aabbccddeeff',
      active: 1
    };
    
    await this.entregaDbRepository.create(ENTREGA_MOCK);
    this.newCategoryName = ''; // Limpiamos el input
  }

  async updateCategory(entrega: Entrega) {
    // Invertimos el estado actual
    const newStatus = entrega.active ? 0 : 1;
    await this.entregaDbRepository.updateById(entrega.id_entrega, newStatus);
  }

  async deleteCategory(category: Entrega) {
    await this.entregaDbRepository.deleteById(category.id_entrega);
  }

}
