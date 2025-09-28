export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  rol: 'admin' | 'paciente' | 'doctor';
}
