export interface UsuarioInterface {
  id?: string | number;         // El signo ? significa opcional
  activo?: number;        // El signo ? significa opcional
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  usuario?: string;
  email?: string;
  id_empresa: string | number | null;
  
  // Estos campos se llenan en el backend, por eso son opcionales
  createdAt?: any;
  updatedAt?: any;
}