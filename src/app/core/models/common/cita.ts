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

// Modelos que representan la estructura real devuelta por GET /citas/{id}
export interface PersonaMini {
  idPersona: number;
  tipoDocumento?: string | null;
  nombre1?: string | null;
  nombre2?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  dni?: string | null;
  fechaNacimiento?: string | null;
  genero?: string | null;
  pais?: string | null;
  departamento?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  email?: string | null;
}

export interface Rol {
  idRol: number;
  nombre: string;
  descripcion?: string | null;
}

export interface UsuarioMini {
  idUsuario: number;
  persona?: PersonaMini | null;
  correo?: string | null;
  rol?: Rol | null;
}

export interface PacienteFull {
  idPaciente: number;
  persona: PersonaMini;
  usuarioAgrego?: UsuarioMini | null;
  tipoSangre?: string | null;
  peso?: number | null;
  altura?: number | null;
  contactoEmergenciaNombre?: string | null;
  contactoEmergenciaRelacion?: string | null;
  contactoEmergenciaTelefono?: string | null;
  email?: string | null;
}

export interface Especialidad {
  idEspecialidad: number;
  nombre: string;
  descripcion?: string | null;
  urlImgIcono?: string | null;
  urlImgPort?: string | null;
  descripcionPortada?: string | null;
}

export interface MedicoPersona {
  idMedico: number;
  persona: PersonaMini;
  colegiatura?: string | null;
  experienciaAnios?: number | null;
  email?: string | null;
  horario?: any | null;
  especialidad?: any | null;
}

export interface MedicoEspecialidad {
  idMedicoEspecialidad: number;
  medico: MedicoPersona;
  especialidad: Especialidad;
}

export interface SubEspecialidad {
  idSubespecialidad: number;
  especialidad: Especialidad;
  nombre: string;
  descripcion?: string | null;
  urlImg?: string | null;
  precioSubespecial?: number | null;
}

export interface DetalleCitaFull {
  idDetalleCita: number;
  medicoEspecialidad?: MedicoEspecialidad | null;
  subEspecialidad?: SubEspecialidad | null;
  precioConsulta?: number | null;
  precioTotal?: number | null;
}

export interface Disponibilidad {
  idDisponibilidad: number;
  medico: MedicoPersona;
  diaSemana?: string | null;
  horaInicio?: string | null;
  horaFin?: string | null;
  estado?: string | null;
  nombreTurno?: string | null;
  vigencia?: boolean;
  diaActivo?: boolean;
  duracionMinutos?: number | null;
}

export interface CitaCompletaFull {
  idCita: number;
  paciente: PacienteFull;
  detalleCita?: DetalleCitaFull | null;
  disponibilidad?: Disponibilidad | null;
  fechaCita?: string | null;
  horaCita?: string | null;
  estado?: string | null;
  motivoConsulta?: string | null;
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



// Interfaces para tus DTOs del backend
export interface CrearCitaRequestDTO {
    idPaciente: number;
    idMedicoEspecialidad: number;
    idSubEspecialidad?: number;
    idBloque: number;
    motivoConsulta: string;
}

export interface CrearCitaResponoseDTO {
    idCita: number;
    pacienteNombre: string;
    medicoNombre: string;
    especialidad: string;
    subEspecialidad?: string;
    fecha: string; // LocalDate se serializa como string
    hora: string;  // LocalTime se serializa como string
    precio: number;
    estado: string;
}

// Interface para datos básicos de creación de cita
export interface DatosCitaBasicos {
    idPaciente: number;
    idMedico: number;
    doctorNombre: string;
    especialidad: string;
    idSubEspecialidad?: number;
    fecha: string;
    hora: string;
    motivoConsulta: string;
}