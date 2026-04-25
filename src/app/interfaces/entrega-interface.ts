export interface EntregaInterface {
  id: string;
  folio: string;
  persona_recibe: string;
  id_repartidor: string;
  id_vehiculo: string;
  colonia: string;
  fec_registropedido: string;
  fec_salidapedido: string;
  fec_entregapedido: string;
  id_tienda: string;
  id_usuario_creador: string;
  estatus: number;
  activo: number;
}