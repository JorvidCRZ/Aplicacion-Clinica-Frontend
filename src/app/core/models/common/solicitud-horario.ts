export interface SolicitudHorarioRequest {
    medicoId: number;
    fecha: string;      // YYYY-MM-DD
    horaInicio: string; // HH:mm:ss
    horaFin: string;    // HH:mm:ss
    motivo: string;
}

export interface SolicitudHorarioResponse {
    id: number;
    medicoId: number;
    medicoNombre: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    estado: string; // 'PENDIENTE', 'APROBADA', 'RECHAZADA'
    motivo: string;
    comentariosAdmin?: string;
}

export interface AprobarSolicitudRequest {
    aprobar: boolean;
    comentarios: string;
}