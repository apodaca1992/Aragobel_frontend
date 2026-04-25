export interface VehiculoInterface {
  id?: string | number;         // El signo ? significa opcional
  nombre: string;
  modelo: string;
  marca: string;
  tipo:  string;
  activo: number;
  id_tienda: string | number | null;
  
  // Estos campos se llenan en el backend, por eso son opcionales
  createdAt?: any;
  updatedAt?: any;
}