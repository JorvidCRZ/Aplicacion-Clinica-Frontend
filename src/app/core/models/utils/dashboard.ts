export interface DashboardStats {
    mascotas: number;
    adopciones: number;
    pedidos: number;
    citas: number;
}

export interface Adopcion {
    id: string;
    nombreMascota: string;
    imagenMascota: string;
    fecha: string;
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    mensaje?: string;
}

export interface Pedido {
    id: string;
    fecha: string;
    estado: 'pendiente' | 'entregado' | 'cancelado';
    total: number;
    productos: PedidoItem[];
}

export interface PedidoItem {
    nombre: string;
    cantidad: number;
    precio: number;
}

export interface ActividadReciente {
    id: string;
    titulo: string;
    descripcion: string;
    fecha: string;
    tipo: 'cita' | 'adopcion' | 'pedido';
    estado: 'pendiente' | 'completado' | 'cancelado';
}
