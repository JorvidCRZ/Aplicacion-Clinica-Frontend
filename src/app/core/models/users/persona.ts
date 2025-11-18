import { Usuario } from "./usuario";

export interface Persona {
    idPersona?: number;
    tipoDocumento: string;
    dni: string;
    nombre1: string;
    nombre2: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: string | Date;
    genero: string;
    pais: string;
    departamento: string;
    provincia: string;
    distrito: string;
    direccion: string;
    telefono: string;
    usuario?: Usuario;
}