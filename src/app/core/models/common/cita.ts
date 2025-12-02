export interface Cita {
  nombreCompleto: string;
  telefono: string;
  email: string;
  cedula: string;
  fechaNacimiento: string;
  genero: string;
  direccion: string;
  especialidadRequerida: string;
  motivoConsulta: string;
  fechaPreferida: string;
  horaPreferida: string;
  notasAdicionales: string;
}

export interface CitaCompleta {
  id: number;
  pacienteNombre: string;
  doctorNombre: string;
  especialidad: string;

  subespecialidad?: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

  pacienteEmail: string;
  pacienteTelefono: string;
  pacienteEdad?: number;

  tipoConsulta: string;
  motivoConsulta: string;
  sintomas?: string;
  notasAdicionales?: string;

  precio?: number;

  fechaCreacion: string;
  fechaModificacion?: string;
  duracionEstimada?: number;
} 

export interface EstadoCita {
  id: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  label: string;
  color: string;
  icon: string;
}

// -----------------------------
// Horarios por médico
// -----------------------------

export interface HorariosMedicoResponse {
  idMedico: number;
  dias: DiaHorario[];
}

export interface DiaHorario {
  fecha: string;        
  diaSemana: string;    
  horarios: string[];   
}