export interface AsistenciaInterface {
  id?: string | number;         // El signo ? significa opcional
  activo?: number;        // El signo ? significa opcional
  fecha?: string;
  hora?: string;
  tipo?: string;
  ubicacion?: any;
  estatus?: string;
  id_tienda: string | number | null;
  id_usuario?: string | number | null;
  
  // Estos campos se llenan en el backend, por eso son opcionales
  createdAt?: any;
  updatedAt?: any;
}