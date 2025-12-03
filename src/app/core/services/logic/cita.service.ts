import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CitaCompleta, CitaCompletaFull } from '../../models/common/cita';

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
    
    /**
     * Actualiza el estado de una cita por id.
     * Endpoint esperado: PATCH /citas/{idCita}/estado
     * Payload: { estado: string }
     */
    actualizarEstadoCita(idCita: number, estado: string): Observable<any> {
        const payload = { estado };
        return this.http.patch<any>(`${this.apiBase}/${idCita}/estado`, payload);
    }
     // Obtener horas totales y promedio de minutos por médico (stats)
    obtenerHorasPromedioPorMedico(idMedico: number): Observable<{ horasTotales: number; promedioMinutos: number }> {
        return this.http.get<{ horasTotales: number; promedioMinutos: number }>(`${this.apiBase}/dashboard/medico/${idMedico}/horas-promedio`);
    }


    // Obtener detalles completos de una cita desde el backend: GET /citas/{id}
    obtenerCitaPorIdFull(id: number): Observable<CitaCompletaFull> {
        return this.http.get<CitaCompletaFull>(`${this.apiBase}/${id}`);
    }

    
     // ======== HISTORIAL CITAS POR MEDICO =========
    // Endpoint: GET /api/historial/citas/medico/{id_medico}
    obtenerHistorialCitasPorMedico(idMedico: number): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/api/historial/citas/medico/${idMedico}`);
    }
}
