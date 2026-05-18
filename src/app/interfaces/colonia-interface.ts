export interface ColoniaInterface {
  id?: string | number;         // El signo ? significa opcional
  activo?: number;        // El signo ? significa opcional
  nombre?: string;
  id_empresa: string | number | null;
  id_tienda: string | number | null;
  
  // Estos campos se llenan en el backend, por eso son opcionales
  createdAt?: any;
  updatedAt?: any;
}