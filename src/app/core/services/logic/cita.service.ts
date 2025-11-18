import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CitaCompleta } from '../../models/common/cita';

@Injectable({
    providedIn: 'root'
})
export class CitaService {
    private http = inject(HttpClient);
    private apiBase = `${environment.apiUrl}/citas`;
    obtenerCitaPorId(id: number): CitaCompleta | undefined {
        return this.obtenerCitas().find(c => c.id === id);
    }

    limpiarCitas(): void {
        localStorage.removeItem(this.storageKey);
    }
    private storageKey = 'citas';

    obtenerCitas(): CitaCompleta[] {
        const citasStr = localStorage.getItem(this.storageKey);
        return citasStr ? JSON.parse(citasStr) : [];
    }

    guardarCita(cita: CitaCompleta): void {
        const citas = this.obtenerCitas();
        if (!cita.id) {
            cita.id = this.generarId();
            cita.fechaCreacion = new Date().toISOString();
        }
        const idx = citas.findIndex(c => c.id === cita.id);
        if (idx > -1) {
            cita.fechaModificacion = new Date().toISOString();
            citas[idx] = cita;
        } else {
            citas.push(cita);
        }
        localStorage.setItem(this.storageKey, JSON.stringify(citas));
    }

    eliminarCita(id: number): void {
        const citas = this.obtenerCitas().filter(c => c.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(citas));
    }

    private generarId(): number {
        const citas = this.obtenerCitas();
        return citas.length ? Math.max(...citas.map(c => c.id)) + 1 : 1;
    }

    // ========= DEMO/SEEDING =========
    seedIfEmptyForDoctor(doctorNombre: string, especialidad?: string): void {
        const existentes = this.obtenerCitas();
        if (existentes.length > 0) return;
        const seed = this.generarCitasDemo(doctorNombre, especialidad);
        localStorage.setItem(this.storageKey, JSON.stringify(seed));
    }

    private generarCitasDemo(doctorNombre: string, especialidad?: string): CitaCompleta[] {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = (hoy.getMonth() + 1).toString().padStart(2, '0');
        const dd = hoy.getDate().toString().padStart(2, '0');
        const hoyISO = `${yyyy}-${mm}-${dd}`;

        const manana = new Date(hoy);
        manana.setDate(hoy.getDate() + 1);
        const mananaISO = `${manana.getFullYear()}-${(manana.getMonth() + 1).toString().padStart(2, '0')}-${manana.getDate().toString().padStart(2, '0')}`;

        const pacientes = [
            { nombre: 'María García López', email: 'maria.garcia@example.com', tel: '999111222' },
            { nombre: 'Carlos Rodríguez Méndez', email: 'carlos.rodriguez@example.com', tel: '999222333' },
            { nombre: 'Ana Martínez Silva', email: 'ana.martinez@example.com', tel: '999333444' },
            { nombre: 'Luis Fernández Castro', email: 'luis.fernandez@example.com', tel: '999444555' },
            { nombre: 'Patricia Jiménez Vega', email: 'patricia.jimenez@example.com', tel: '999555666' },
            { nombre: 'Roberto Sánchez Torres', email: 'roberto.sanchez@example.com', tel: '999666777' },
            { nombre: 'Carmen Delgado Ruiz', email: 'carmen.delgado@example.com', tel: '999777888' },
            { nombre: 'Javier Morales Díaz', email: 'javier.morales@example.com', tel: '999888999' },
            { nombre: 'Isabella Torres Muñoz', email: 'isabella.torres@example.com', tel: '999000111' },
            { nombre: 'Diego Rivas Paredes', email: 'diego.rivas@example.com', tel: '999000222' }
        ];

        const tipos = especialidad && especialidad.toLowerCase().includes('cardio')
            ? ['Control Cardiológico', 'Electrocardiograma', 'Ecocardiograma', 'Consulta Urgente']
            : ['Consulta General', 'Control', 'Chequeo Preventivo', 'Urgencia'];

        const horasHoy = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30'];
        const horasManana = ['08:00', '08:30', '09:00', '09:30'];

        let id = 1;
        const ahora = new Date();
        const mkEstado = (fecha: string, hora: string): CitaCompleta['estado'] => {
            const dt = new Date(`${fecha}T${hora}:00`);
            if (dt < ahora) return 'completada';
            return (id % 4 === 0) ? 'cancelada' : (id % 2 === 0 ? 'confirmada' : 'pendiente');
        };

        const build = (fecha: string, hora: string, pIdx: number): CitaCompleta => ({
            id: id++,
            pacienteNombre: pacientes[pIdx % pacientes.length].nombre,
            doctorNombre,
            especialidad: especialidad || 'Medicina General',
            fecha,
            hora,
            estado: mkEstado(fecha, hora),
            pacienteEmail: pacientes[pIdx % pacientes.length].email,
            pacienteTelefono: pacientes[pIdx % pacientes.length].tel,
            tipoConsulta: tipos[pIdx % tipos.length],
            motivoConsulta: 'Consulta de demostración',
            fechaCreacion: new Date().toISOString(),
            duracionEstimada: [30, 45, 60][pIdx % 3]
        });

        const result: CitaCompleta[] = [];
        horasHoy.forEach((h, i) => result.push(build(hoyISO, h, i)));
        horasManana.forEach((h, i) => result.push(build(mananaISO, h, i + horasHoy.length)));
        return result;
    }

    // ======= BACKEND STATS (por médico) =======
    contarCitasPorMedico(idMedico: number): Observable<number> {
        return this.http.get<number>(`${this.apiBase}/medico/${idMedico}/totalcitas`);
    }

    contarCitasDelMesActualPorMedico(idMedico: number): Observable<number> {
        return this.http.get<number>(`${this.apiBase}/mes/total/${idMedico}`);
    }

    

    //========BACKEND STATS CITAS POR MEDICO=========

    obtenerCitasDashboardPorMedico(idMedico: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/dashboard/medico/${idMedico}`);
    }
}
