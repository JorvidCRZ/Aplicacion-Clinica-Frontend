import { Usuario } from "./usuario";

export interface Paciente extends Usuario {
    rol: 'paciente';
    
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: Date;
    genero: 'masculino' | 'femenino' | 'otro';

    pais: string;
    departamento: string;
    provincia: string;
    distrito: string;
    domicilio: string;

    historialMedico?: string;
    alergias?: string[];
    contactoEmergencia?: {
        nombre: string;
        telefono: string;
        relacion: string;
    };
}