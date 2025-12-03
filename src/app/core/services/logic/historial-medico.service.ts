import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HistorialMedicoCreate, HistorialMedico } from '../../models/common/historial-medico';

@Injectable({ providedIn: 'root' })
export class HistorialMedicoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/historial-medico`;

  /** Obtener todos los historiales médicos de un paciente */
  getHistorialPorPaciente(idPaciente: number): Observable<HistorialMedico[]> {
    return this.http.get<HistorialMedico[]>(`${this.base}/paciente/${idPaciente}`);
  }

  /** Obtener historiales por paciente y médico (ruta: /historial-medico/paciente/{id_paciente}/medico/{id_medico}) */
  getHistorialPorPacienteYMedico(idPaciente: number, idMedico: number): Observable<HistorialMedico[]> {
    return this.http.get<HistorialMedico[]>(`${this.base}/paciente/${idPaciente}/medico/${idMedico}`);
  }

  /** Crear un nuevo registro de historial médico */
  crearHistorial(payload: HistorialMedicoCreate): Observable<HistorialMedico> {
    return this.http.post<HistorialMedico>(this.base, payload);
  }

  /** Actualizar un registro de historial médico por id */
  actualizarHistorial(idHistorial: number, payload: Partial<HistorialMedicoCreate>): Observable<HistorialMedico> {
    return this.http.put<HistorialMedico>(`${this.base}/update/${idHistorial}`, payload);
  }
}

    