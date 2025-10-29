import { Persona } from './persona';
import { Usuario } from './usuario';

export interface Paciente {
  idPaciente?: number;
  persona: Persona;
  usuarioAgrego?: Usuario;
}