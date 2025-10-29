import { Persona } from './persona';

export interface Doctor {
  idMedico: number;
  persona: Persona;
  colegiatura: string;
  experienciaAnios: number;
}
