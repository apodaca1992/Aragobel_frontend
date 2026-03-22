import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { DeviceService } from '@services/device.service';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';

const DB_NAME = 'aragobeldb';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  public isWeb: boolean = false;

  // 🟢 El semáforo: Avisa cuando la conexión está lista
  private isReady = new BehaviorSubject<boolean>(false);

  constructor(private deviceService: DeviceService) { }

  /**
   * MÉTODO SENIOR: En lugar de un getter simple que puede devolver undefined,
   * este método espera a que la base de datos esté realmente abierta.
   */
  async getDbConnection(): Promise<SQLiteDBConnection> {
    // Si ya está lista, devuelve la db. Si no, espera a que isReady sea true.
    await firstValueFrom(this.isReady.asObservable().pipe(filter(ready => ready)));
    return this.db;
  }

  async initializaePlugin(): Promise<boolean> {
    const platform = await this.deviceService.getPlatform();
    const sqlitePlugin = CapacitorSQLite as any;

    if (platform === 'web') {
      this.isWeb = true;
      await sqlitePlugin.initWebStore();
    }

    try {
      this.db = await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
      await this.db.open();

      // Esquema inicial (Tablas)
      const schema = `
        CREATE TABLE IF NOT EXISTS entregas (
          id_entrega TEXT PRIMARY KEY NOT NULL,   
          folio TEXT NOT NULL,
          id_repartidor TEXT NOT NULL,           
          id_vehiculo TEXT,                       
          colonia TEXT,
          fec_registropedido TEXT NOT NULL,      
          fec_salidapedido TEXT,                 
          fec_entregapedido TEXT,                 
          id_tienda TEXT NOT NULL,              
          active INTEGER DEFAULT 1
        );
      `;
      await this.db.execute(schema);

      // 🟢 Notificamos que la base de datos está lista para usarse
      this.isReady.next(true);
      return true;
    } catch (error) {
      console.error('Error DB:', error);
      return false;
    }
  }

  /**
   * Método de utilidad para persistir en Web
   */
  async persist() {
    if (this.isWeb) await this.sqlite.saveToStore(DB_NAME);
  }
}