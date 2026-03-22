import { Injectable, signal } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Entrega } from '@interfaces/entrega-interface'; // Ajusta según tu interfaz
//import { v4 as uuidv4 } from 'uuid'; //uuidv4() Librería popular para generar UUIDs

@Injectable({
  providedIn: 'root'
})
export class EntregaDbRepository {
  // Usamos un Signal para que la UI se actualice automáticamente
  public entregas = signal<Entrega[]>([]);

  constructor(private dbService: DatabaseService) {}

  async loadAll() {
    // 🟢 Esto "pausará" la ejecución hasta que la DB esté abierta tras el F5
    const db = await this.dbService.getDbConnection();
    const res = await db.query('SELECT * FROM entregas;');
    this.entregas.set(res.values || []);
  }

  async create(pedido: Entrega) {
    const db = await this.dbService.getDbConnection();
    const query = `
      INSERT INTO entregas (
        id_entrega, folio, id_repartidor, id_vehiculo, colonia, 
        fec_registropedido, fec_salidapedido, fec_entregapedido, id_tienda, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      pedido.id_entrega,
      pedido.folio,
      pedido.id_repartidor,
      pedido.id_vehiculo,
      pedido.colonia,
      pedido.fec_registropedido, // Asegúrate de enviar .toISOString()
      pedido.fec_salidapedido,
      pedido.fec_entregapedido,
      pedido.id_tienda,
      pedido.active
    ];

    await db.run(query, values);
    await this.dbService.persist(); // Guardar si es web
    await this.loadAll(); // Refrescar señal
  }

  async updateById(id: string, active: number) {
    const db = await this.dbService.getDbConnection();
    const query = `UPDATE entregas SET active = ? WHERE id_entrega = ?;`;
    await db.run(query, [active, id]);
    await this.dbService.persist();
    await this.loadAll();
  }

  async deleteById(id: string){
    const db = await this.dbService.getDbConnection();
    const query = `DELETE FROM entregas WHERE id_entrega = ?;`;
    await db.run(query, [id]);
    await this.dbService.persist();
    await this.loadAll();
  }
}