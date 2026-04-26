export interface AsistenciaInterface {
  id?: string | number;         // El signo ? significa opcional
  activo: number;
  id_tienda: string | number | null;
  
  // Estos campos se llenan en el backend, por eso son opcionales
  createdAt?: any;
  updatedAt?: any;
}