import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CitaCompleta, CitaCompletaFull, CrearCitaRequestDTO, CrearCitaResponoseDTO, DatosCitaBasicos } from '../../models/common/cita';
import { HorarioService } from './horario.service';

@Injectable({
    providedIn: 'root'
})
export class CitaService {
    private http = inject(HttpClient);
    private horarioService = inject(HorarioService);
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
    actualizarEstadoCitas(idCita: number, estado: string): Observable<any> {
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
    
    

 // ======== NUEVOS ENDPOINTS BACKEND =========
    
    // Crear nueva cita usando tu endpoint POST /agregar
    crearCitaBackend(requestData: CrearCitaRequestDTO): Observable<CrearCitaResponoseDTO> {
        return this.http.post<CrearCitaResponoseDTO>(`${this.apiBase}/agregar`, requestData);
    }

    // Obtener cita por ID usando tu endpoint GET /obtenerCita/{id}
    obtenerCitaBackendPorId(id: number): Observable<CrearCitaResponoseDTO> {
        return this.http.get<CrearCitaResponoseDTO>(`${this.apiBase}/obtenerCita/${id}`);
    }

    // Listar todas las citas usando tu endpoint GET /todos
    listarTodasLasCitas(): Observable<CrearCitaResponoseDTO[]> {
        return this.http.get<CrearCitaResponoseDTO[]>(`${this.apiBase}/todos`);
    }

    // Obtener citas por paciente (cuando tengas el endpoint específico)
    obtenerCitasPorPaciente(idPaciente: number): Observable<CrearCitaResponoseDTO[]> {
        return this.http.get<CrearCitaResponoseDTO[]>(`${this.apiBase}/paciente/${idPaciente}`);
    }

    // Actualizar estado de una cita
    actualizarEstadoCita(idCita: number, nuevoEstado: string): Observable<any> {
        return this.http.put(`${this.apiBase}/actualizar-estado/${idCita}`, { estado: nuevoEstado });
    }

    // ======== MÉTODOS DE RESOLUCIÓN DE IDS =========
    
    // Resolver ID de bloque basado en médico, fecha y hora
    resolverIdBloque(idMedico: number, fecha: string, hora: string): Observable<number> {
        return new Observable(observer => {
            this.horarioService.buscarBloqueEspecifico(idMedico, fecha, hora).subscribe({
                next: (bloque) => {
                    observer.next(bloque.idBloque);
                    observer.complete();
                },
                error: (err) => {
                    console.error('Error resolviendo ID de bloque:', err);
                    observer.error(err);
                }
            });
        });
    }

    // Resolver ID de médico-especialidad (necesitarás un endpoint en el backend)
    resolverMedicoEspecialidad(doctorNombre: string, especialidad: string): Observable<number> {
        // Endpoint que debes crear en el backend: GET /api/medico-especialidad/buscar
        const params = { medicoNombre: doctorNombre, especialidad: especialidad };
        return this.http.get<{idMedicoEspecialidad: number}>(`${environment.apiUrl}/medico-especialidad/buscar`, { params })
            .pipe(
                map(response => response.idMedicoEspecialidad)
            );
    }

    // Crear cita completa con resolución automática de IDs
    crearCitaCompleta(datosBasicos: DatosCitaBasicos): Observable<CrearCitaResponoseDTO> {
        return new Observable(observer => {
            // Paso 1: Resolver ID de médico-especialidad
            this.resolverMedicoEspecialidad(datosBasicos.doctorNombre, datosBasicos.especialidad).subscribe({
                next: (idMedicoEspecialidad) => {
                    // Paso 2: Resolver ID de bloque
                    this.resolverIdBloque(datosBasicos.idMedico, datosBasicos.fecha, datosBasicos.hora).subscribe({
                        next: (idBloque) => {
                            // Paso 3: Crear cita con IDs resueltos
                            const request: CrearCitaRequestDTO = {
                                idPaciente: datosBasicos.idPaciente,
                                idMedicoEspecialidad: idMedicoEspecialidad,
                                idSubEspecialidad: datosBasicos.idSubEspecialidad,
                                idBloque: idBloque,
                                motivoConsulta: datosBasicos.motivoConsulta
                            };

                            this.crearCitaBackend(request).subscribe({
                                next: (citaCreada) => {
                                    observer.next(citaCreada);
                                    observer.complete();
                                },
                                error: (err) => observer.error(err)
                            });
                        },
                        error: (err) => observer.error(err)
                    });
                },
                error: (err) => observer.error(err)
            });
        });
    }
    
    
}

