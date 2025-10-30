import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Usuario } from '../../../../../core/models/users/usuario';
import { CitaCompleta } from '../../../../../core/models/common/cita';
import { CitaService } from '../../../../../core/services/logic/cita.service';
import { PagosService } from '../../../../../core/services/logic/pagos.service';

interface EstadisticaPanel {
    titulo: string;
    valor: number;
    icono: string;
    color: string;
    cambio?: string;
    tendencia?: 'up' | 'down' | 'stable';
}

interface CitaReciente {
    id: number;
    paciente: string;
    doctor: string;
    fecha: string;
    hora: string;
    estado: string;
}

@Component({
    selector: 'app-panel',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './panel.component.html',
    styleUrl: './panel.component.css'
})
export class PanelComponent implements OnInit {
    constructor(private citaService: CitaService, private pagosService: PagosService) { }
    //  Fecha actual
    fechaActual = new Date();

    // Estadísticas principales
    estadisticas: EstadisticaPanel[] = [];

    //  Citas de hoy
    citasHoy: CitaReciente[] = [];

    //  Datos para gráficos
    citasPorEstado = {
        confirmadas: 0,
        pendientes: 0,
        completadas: 0,
        canceladas: 0
    };

    ngOnInit(): void {
        this.cargarEstadisticas();
        this.cargarCitasHoy();
        this.cargarEstadisticasCitas();
    }

    // Cargar estadísticas principales
    private cargarEstadisticas(): void {
        const citas = this.obtenerCitas();
        const pacientesUnicos = new Set((citas || []).map(c => (c.pacienteEmail || '').toLowerCase()).filter(Boolean));
        const doctoresUnicos = new Set((citas || []).map(c => (c.doctorNombre || '').toLowerCase()).filter(Boolean));

        // Ingresos reales desde facturas
        const hoyISO = new Date().toISOString().slice(0, 10);
        const ahora = new Date();
        const mesInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const facturas = this.pagosService.obtenerFacturas().filter(f => f.estado === 'pagado');
        const ingresosHoy = facturas
            .filter(f => (new Date(f.fecha).toISOString().slice(0, 10)) === hoyISO)
            .reduce((s, f) => s + (f.total || 0), 0);
        const ingresosMes = facturas
            .filter(f => new Date(f.fecha) >= mesInicio && new Date(f.fecha) <= ahora)
            .reduce((s, f) => s + (f.total || 0), 0);

        this.estadisticas = [
            {
                titulo: 'Total Pacientes',
                valor: pacientesUnicos.size,
                icono: 'fa-users',
                color: '#2363B9',
                cambio: undefined,
                tendencia: 'stable'
            },
            {
                titulo: 'Doctores Activos',
                valor: doctoresUnicos.size,
                icono: 'fa-user-md',
                color: '#8fddff',
                cambio: undefined,
                tendencia: 'stable'
            },
            {
                titulo: 'Citas Programadas',
                valor: citas.filter(c => c.estado === 'confirmada' || c.estado === 'pendiente').length,
                icono: 'fa-calendar-check',
                color: '#4CAF50',
                cambio: undefined,
                tendencia: 'stable'
            },
            {
                titulo: 'Citas Completadas',
                valor: citas.filter(c => c.estado === 'completada').length,
                icono: 'fa-check-circle',
                color: '#FF9800',
                cambio: undefined,
                tendencia: 'stable'
            },
            {
                titulo: 'Ingresos Hoy (S/)',
                valor: +ingresosHoy.toFixed(2),
                icono: 'fa-coins',
                color: '#17a2b8',
                cambio: undefined,
                tendencia: 'stable'
            },
            {
                titulo: 'Ingresos del Mes (S/)',
                valor: +ingresosMes.toFixed(2),
                icono: 'fa-money-bill-wave',
                color: '#6f42c1',
                cambio: undefined,
                tendencia: 'stable'
            }
        ];
    }

    //  Cargar citas de hoy
    private cargarCitasHoy(): void {
        const citas = this.obtenerCitas();
        const hoy = new Date().toISOString().split('T')[0];

        this.citasHoy = citas
            .filter(cita => cita.fecha === hoy)
            .map(cita => ({
                id: cita.id,
                paciente: cita.pacienteNombre,
                doctor: cita.doctorNombre,
                fecha: cita.fecha,
                hora: cita.hora,
                estado: cita.estado
            }))
            .slice(0, 5); // Mostrar solo las primeras 5
    }

    // Cargar estadísticas de citas
    private cargarEstadisticasCitas(): void {
        const citas = this.obtenerCitas();

        this.citasPorEstado = {
            confirmadas: citas.filter(c => c.estado === 'confirmada').length,
            pendientes: citas.filter(c => c.estado === 'pendiente').length,
            completadas: citas.filter(c => c.estado === 'completada').length,
            canceladas: citas.filter(c => c.estado === 'cancelada').length
        };
    }

    // Obtener usuarios desde localStorage
    private obtenerUsuarios(): Usuario[] {
        const usuariosStr = localStorage.getItem('usuarios');
        return usuariosStr ? JSON.parse(usuariosStr) : [];
    }

    //  Obtener citas desde localStorage
    private obtenerCitas(): CitaCompleta[] {
        // Usar el servicio centralizado de citas
        try {
            return this.citaService.obtenerCitas();
        } catch {
            const citasStr = localStorage.getItem('citas');
            return citasStr ? JSON.parse(citasStr) : [];
        }
    }

    // Obtener clase CSS para el estado de cita
    getEstadoClass(estado: string): string {
        switch (estado) {
            case 'confirmada': return 'estado-confirmada';
            case 'pendiente': return 'estado-pendiente';
            case 'completada': return 'estado-completada';
            case 'cancelada': return 'estado-cancelada';
            default: return 'estado-default';
        }
    }

    //  Calcular porcentaje para gráficos
    calcularPorcentaje(valor: number, total: number): number {
        return total > 0 ? Math.round((valor / total) * 100) : 0;
    }

    // Obtener total de citas
    get totalCitas(): number {
        return Object.values(this.citasPorEstado).reduce((sum, count) => sum + count, 0);
    }
}
