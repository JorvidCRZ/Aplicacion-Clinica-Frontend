export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  rol: 'admin' | 'paciente' | 'doctor';
  
  tipoDocumento: string;  
  numeroDocumento: string;
  
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  fechaNacimiento?: Date;
  genero?: 'masculino' | 'femenino' | 'otro';
  pais?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  domicilio?: string;
}


