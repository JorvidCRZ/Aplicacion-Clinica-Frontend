export interface HistorialMedicoCreate {
  id?: number;
  idPaciente: number;
  idCita?: number | null;
  idMedico?: number | null;
  diagnostico?: string | null;
  observaciones?: string | null;
  receta?: string | null;
  fecha?: string | null;
}

// Interfaces para el listado completo (según payload de backend)
export interface PersonaMini {
  idPersona?: number;
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
}

export interface RolMini {
  idRol?: number;
  nombre?: string;
  descripcion?: string | null;
}

export interface UsuarioAgrego {
  idUsuario?: number;
  persona?: PersonaMini | null;
  correo?: string | null;
  rol?: RolMini | null;
}

export interface PacienteListado {
  idPaciente?: number;
  persona?: PersonaMini | null;
  usuarioAgrego?: UsuarioAgrego | null;
  tipoSangre?: string | null;
  peso?: number | null;
  altura?: number | null;
  contactoEmergenciaNombre?: string | null;
  contactoEmergenciaRelacion?: string | null;
  contactoEmergenciaTelefono?: string | null;
  email?: string | null;
}

export interface MedicoListado {
  idMedico?: number;
  persona?: PersonaMini | null;
  colegiatura?: string | null;
  experienciaAnios?: number | null;
  email?: string | null;
  horario?: any;
  especialidad?: any;
}

export interface EspecialidadMini {
  idEspecialidad?: number;
  nombre?: string | null;
  descripcion?: string | null;
  urlImgIcono?: string | null;
  urlImgPort?: string | null;
  descripcionPortada?: string | null;
}

export interface MedicoEspecialidad {
  idMedicoEspecialidad?: number;
  medico?: MedicoListado | null;
  especialidad?: EspecialidadMini | null;
}

export interface SubEspecialidad {
  idSubespecialidad?: number;
  especialidad?: EspecialidadMini | null;
  nombre?: string | null;
  descripcion?: string | null;
  urlImg?: string | null;
  precioSubespecial?: number | null;
}

export interface DetalleCitaListado {
  idDetalleCita?: number;
  medicoEspecialidad?: MedicoEspecialidad | null;
  subEspecialidad?: SubEspecialidad | null;
  precioConsulta?: number | null;
  precioTotal?: number | null;
}

export interface DisponibilidadListado {
  idDisponibilidad?: number;
  medico?: MedicoListado | null;
  diaSemana?: string | null;
  horaInicio?: string | null;
  horaFin?: string | null;
  estado?: string | null;
  nombreTurno?: string | null;
  vigencia?: boolean | null;
  diaActivo?: boolean | null;
  duracionMinutos?: number | null;
}

export interface CitaListado {
  idCita?: number;
  paciente?: PacienteListado | null;
  detalleCita?: DetalleCitaListado | null;
  disponibilidad?: DisponibilidadListado | null;
  fechaCita?: string | null;
  horaCita?: string | null;
  estado?: string | null;
  motivoConsulta?: string | null;
}

export interface HistorialMedicoListado {
  idHistorial?: number;
  paciente?: PacienteListado | null;
  cita?: CitaListado | null;
  medico?: MedicoListado | null;
  diagnostico?: string | null;
  observaciones?: string | null;
  receta?: string | null;
  fecha?: string | null;
}

export type HistorialMedico = HistorialMedicoListado;


