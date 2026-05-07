export interface TiendaInterface {
  id?: string | number;         // El signo ? significa opcional
  activo?: number;        // El signo ? significa opcional
  nombre?: string;
  ubicacion?: any;
  id_empresa: string | number | null;
  configuracion_asistencia?: any;
  
  // Estos campos se llenan en el backend, por eso son opcionales
  createdAt?: any;
  updatedAt?: any;
}