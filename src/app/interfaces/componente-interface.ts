export interface ComponenteInterface {
  name: string;
  redirectTo: string;
  icon: string;
  section?: 'OPERACION' | 'CUENTA' | 'ADMINISTRACION'; // Definimos los valores permitidos
  permisoRequerido?: string;         // Aprovechamos de agregar esta para los permisos
}