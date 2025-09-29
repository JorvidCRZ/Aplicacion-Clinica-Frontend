import { Usuario } from "./usuario";

export interface Doctor extends Usuario {
    especialidad: string;
    nroColegiado: string;
    horario?: string;
    rol: 'doctor';
}
