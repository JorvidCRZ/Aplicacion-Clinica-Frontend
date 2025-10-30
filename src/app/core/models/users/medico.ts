import { Persona } from './persona';

export interface Medico {
  idMedico: number;
  persona: Persona;
  colegiatura: string;
  experienciaAnios: number;
}
