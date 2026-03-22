export interface Entrega {
  id_entrega: string;
  folio: string;
  id_repartidor: string;
  id_vehiculo: string;
  colonia: string;
  fec_registropedido: string;
  fec_salidapedido: string;
  fec_entregapedido: string;
  id_tienda: string;
  active: number;
}