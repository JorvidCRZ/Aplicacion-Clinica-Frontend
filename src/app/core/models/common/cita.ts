// Interfaz para formularios de citas simples
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
  // Nombre de la subespecialidad seleccionada (si aplica)
  subespecialidad?: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

  // Datos del paciente
  pacienteEmail: string;
  pacienteTelefono: string;
  pacienteEdad?: number;

  // Detalles de la cita médica
  tipoConsulta: string;
  motivoConsulta: string;
  sintomas?: string;
  notasAdicionales?: string;

  // Precio base pagado por la consulta (sin comisión del método de pago)
  precio?: number;

  // Metadatos
  fechaCreacion: string;
  fechaModificacion?: string;
  duracionEstimada?: number; // en minutos
}

export interface EstadoCita {
  id: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  label: string;
  color: string;
  icon: string;
}