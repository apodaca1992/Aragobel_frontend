export interface AuthInterface{
    id                   : number;
    nombreUsuario        : string;
    correoElectronico    : string;
    token                : string;
    permissions         ?: any[];
}

export interface AuthLoginInterface{
    nombreUsuario : string;
    password      : string;
}
