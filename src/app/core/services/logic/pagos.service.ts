import { Injectable } from '@angular/core';
import { CitaCompleta } from '../../models/common/cita';

export interface Factura {
    id: string;
    numeroFactura: string;
    fecha: string; // ISO
    fechaVencimiento: string; // ISO
    concepto: string;
    descripcion: string;
    doctor: string;
    especialidad: string;
    subespecialidad?: string;
    subtotal: number;
    igv: number;
    total: number;
    estado: 'pendiente' | 'pagado' | 'vencido' | 'cancelado';
    metodoPago?: string;
    fechaPago?: string; // ISO
    numeroTransaccion?: string;
    // vínculo
    pacienteEmail?: string;
    citaId?: number;
}

@Injectable({ providedIn: 'root' })
export class PagosService {
    private storageKey = 'facturas';

    obtenerFacturas(): Factura[] {
        const raw = localStorage.getItem(this.storageKey);
        return raw ? JSON.parse(raw) : [];
    }

    guardarFacturas(list: Factura[]) {
        localStorage.setItem(this.storageKey, JSON.stringify(list));
    }

    agregarFactura(f: Factura) {
        const list = this.obtenerFacturas();
        list.unshift(f);
        this.guardarFacturas(list);
    }

    getFacturasByEmail(email: string): Factura[] {
        return this.obtenerFacturas().filter(f => f.pacienteEmail === email);
    }

    addFacturaFromCita(cita: CitaCompleta, pacienteEmail: string, metodoPago: string = 'Tarjeta de Crédito', precioBase?: number): Factura {
        // Priorizar el precio usado en Checkout; si no está, usar el parámetro; si no, fallback por especialidad.
        const precio = (typeof cita.precio === 'number' && cita.precio > 0)
            ? cita.precio
            : (typeof precioBase === 'number' && precioBase > 0)
                ? precioBase
                : this.precioPorEspecialidad(cita.especialidad);
        const subtotal = precio;
        // Por solicitud: no aplicar IGV en facturas del historial para que coincida con el precio mostrado en Checkout
        const igv = 0;
        const total = +(subtotal + igv).toFixed(2);
        const now = new Date();

        const factura: Factura = {
            id: 'FAC-' + Date.now(),
            numeroFactura: 'F001-' + (Math.floor(Math.random() * 900000) + 100000).toString(),
            fecha: now.toISOString(),
            fechaVencimiento: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            concepto: `Consulta ${cita.especialidad}${cita.subespecialidad ? ' — ' + cita.subespecialidad : ''}`,
            descripcion: `Consulta de ${cita.especialidad}${cita.subespecialidad ? ' (' + cita.subespecialidad + ')' : ''} con ${cita.doctorNombre} para ${cita.pacienteNombre}`,
            doctor: cita.doctorNombre,
            especialidad: cita.especialidad,
            subespecialidad: cita.subespecialidad,
            subtotal,
            igv,
            total,
            estado: 'pagado',
            metodoPago,
            fechaPago: now.toISOString(),
            numeroTransaccion: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
            pacienteEmail,
            citaId: cita.id
        };

        this.agregarFactura(factura);
        return factura;
    }

    private precioPorEspecialidad(especialidad: string): number {
        const precios: Record<string, number> = {
            'Cardiología': 150,
            'Dermatología': 120,
            'Pediatría': 100,
            'Ginecología': 130,
            'Medicina General': 80,
            'Traumatología': 140,
            'Psicología': 110,
            'Odontología': 90,
            'Oftalmología': 110,
            'Neurología': 160,
            'Endocrinología': 150,
            'Reumatología': 140,
            'Urología': 130
        };
        return precios[especialidad] ?? 100;
    }
}
