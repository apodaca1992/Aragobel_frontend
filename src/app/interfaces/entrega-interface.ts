export interface EntregaInterface {
  id?: string | number;         // El signo ? significa opcional
  folio: string;
  persona_recibe: string;
  colonia: string;
  estatus: number;
  activo: number;
  id_tienda: string | number | null;
  id_usuario_creador: string | number | null;
  fecha_venta: string;
  
  // Estos campos se llenan en el backend, por eso son opcionales
  id_repartidor?: string | number | null;
  id_vehiculo?: string | number | null;
  fec_registropedido?: any;
  fec_salidapedido?: any;
  fec_entregapedido?: any;
  createdAt?: any;
  updatedAt?: any;
}