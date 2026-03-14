import { Injectable, signal, WritableSignal } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { DeviceService } from './device.service';

const disiMovilDb = 'disimovildb';

export interface Category {
  id: number;
  name: string;
  active: number;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private categories: WritableSignal<Category[]> = signal<Category[]>([]);
  // Indica si estamos en web
  public isWeb: boolean;
  // Indica si estamos en IOS
  public isIOS: boolean;

  constructor(private deviceService: DeviceService) { 
    this.isWeb = false;
    this.isIOS = false;
  }

  async initializaePlugin(){
    
    const platform = await this.deviceService.getPlatform();
    // CapacitorSQLite no tiene disponible el metodo requestPermissions pero si existe y es llamable
    const sqlite = CapacitorSQLite as any;

    // Si estamos en android, pedimos permiso
    if (platform == 'android') {
      try {
        await sqlite.requestPermissions();
      } catch (error) {
        console.error("Esta app necesita permisos para funcionar")
      }
      // Si estamos en web, iniciamos la web store
    } else if (platform == 'web') {
      this.isWeb = true;
      await sqlite.initWebStore();
      //return true;
    } else if (platform == 'ios') {
      this.isIOS = true;
    }

    this.db = await this.sqlite.createConnection(
      disiMovilDb,
      false,
      'no-encryption',
      1,
      false
    );

    await this.db.open();

    const schema = `CREATE TABLE IF NOT EXISTS categories (
      id  INTEGER PRIMARY KEY AUTOINCREMENT,
      name  TEXT NOT NULL,
      active INTEGER DEFAULT 1
    )`;

    await this.db.execute(schema);

    this.loadCategories();
    return true;
  }

  getCategories(){
    return this.categories;
  }

  async loadCategories(){
    const categories = await this.db.query('SELECT * FROM categories;');
    this.categories.set(categories.values || []);
  }

  async addCategory(name: string){
    const query = `INSERT INTO categories (name) VALUES ('${name}')`;
    const result = await this.db.query(query);
    this.loadCategories();
    return result;
  }

  async updateCategoryById(id: string, active: number){
    const query = `UPDATE categories SET active=${active} WHERE id=${id}`;
    const result = await this.db.query(query);
    this.loadCategories();
    return result;
  }

  async deleteCategoryById(id: string){
    const query = `DELETE FROM categories WHERE id=${id}`;
    const result = await this.db.query(query);
    this.loadCategories();
    return result;
  }
}
