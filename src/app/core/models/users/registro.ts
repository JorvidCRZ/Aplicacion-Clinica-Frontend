import { Persona } from './persona';

export interface UsuarioRegistro {
  correo: string;
  contrasena: string;
  idRol: number;
  persona: Persona;
}