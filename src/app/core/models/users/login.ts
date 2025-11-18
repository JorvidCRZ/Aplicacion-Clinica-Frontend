export interface LoginRequest {
    correo: string;
    contrasena: string;
}

export interface LoginResponse {
    idUsuario: number;
    correo: string;
    rol: string;
    nombre1: string;
    nombre2?: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    token?: string;
}
