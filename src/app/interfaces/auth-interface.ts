export interface AuthInterface{
    token                : string;
    user                 : AuthUserInterface;
    permisos            ?: any[];
}

export interface AuthLoginInterface{
    nombreUsuario : string;
    password      : string;
}

export interface AuthUserInterface{
    id                   : string;
    usuario              : string;
    roles               : any[];
}