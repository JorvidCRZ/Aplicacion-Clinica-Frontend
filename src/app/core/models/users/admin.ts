import { Usuario } from "./usuario";

export interface Admin extends Usuario {
  permisos: string[];
  rol: 'admin';
}
