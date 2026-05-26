export interface AuthInterface{
    token                : string;
    user                 : AuthUserInterface;
    permisos            ?: any[];
    empresa              : any;
}

export interface AuthLoginInterface{
    nombreUsuario : string;
    password      : string;
}

export interface AuthUserInterface{
    id                   : string;
    usuario              : string;
    roles               : any[];
    tiendas_asignadas   : any[];
    id_tienda    : string;
    nombre_tienda : string;
    //LIBBRE
    jornada_efectiva ?: number;
	tiempo_comida_max ?: number;
    //FIJO
    tipo_esquema  : string;
    hora_entrada  ?: string;
    hora_salida_comer  ?: string;
    hora_regreso_comer  ?: string;
    hora_salida  ?: string;
    tolerancia_minutos ?: number;
 
    tienda_activa_config   : {};
}