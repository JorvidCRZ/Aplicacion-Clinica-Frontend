import { Persona } from './persona';
import { Rol } from './rol';

export interface Usuario {
  idUsuario?: number;
  correo: string;
  password?: string;
  rol: Rol;
  persona: Persona;
  token?: string;
}