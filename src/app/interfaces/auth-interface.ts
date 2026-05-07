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
    configuracion_asistencia   : {};
}