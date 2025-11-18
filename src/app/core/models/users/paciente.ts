import { Persona } from './persona';
import { Rol } from './rol';
import { Usuario } from './usuario';

export interface Paciente {
  rol?: Rol;
  idPaciente?: number;
  persona: Persona;
  usuario?: Usuario;
  usuarioAgrego?: Usuario;

  tipoSangre?: string;
  peso?: number;
  altura?: number;
  email?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaRelacion?: string;
  contactoEmergenciaTelefono?: string;
}
