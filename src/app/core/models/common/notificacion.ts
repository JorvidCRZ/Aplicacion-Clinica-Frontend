export interface Notificacion {
    id: number;
    titulo: string;
    mensaje: string;
    tipo: string; // 'SOLICITUD_HORARIO', 'APROBACION_HORARIO', 'RECHAZO_HORARIO'
    leida: boolean;
    fechaCreacion: string;
    solicitudHorarioId?: number;
}