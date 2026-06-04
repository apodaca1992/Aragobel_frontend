export interface RolInterface {
  id?: string | number;         // El signo ? significa opcional
  activo?: number;        // El signo ? significa opcional
  nombre?: string;     
  descripcion?: string;
  permisos?: any;
  
  // Estos campos se llenan en el backend, por eso son opcionales
  createdAt?: any;
  updatedAt?: any;
}