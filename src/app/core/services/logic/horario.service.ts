import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HorariosMedicoResponse } from '../../models/common/cita';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
    private baseUrl =`${environment.apiUrl}/horario-bloque`;

  constructor(private http: HttpClient) {}

  // Endpoint actual - solo devuelve horarios como strings
  getHorariosPorMedico(idMedico: number): Observable<HorariosMedicoResponse> {
    return this.http.get<HorariosMedicoResponse>(`${this.baseUrl}/medico/${idMedico}`);
  }

  // Nuevo: Obtener bloques completos con IDs por médico y fecha específica
  getBloquesConIds(idMedico: number, fecha: string): Observable<BloqueHorario[]> {
    return this.http.get<BloqueHorario[]>(`${this.baseUrl}/bloques/${idMedico}/${fecha}`);
  }

  // Nuevo: Buscar bloque específico por médico, fecha y hora
  buscarBloqueEspecifico(idMedico: number, fecha: string, hora: string): Observable<BloqueHorario> {
    return this.http.get<BloqueHorario>(`${this.baseUrl}/buscar-bloque/${idMedico}/${fecha}/${hora}`);
  }

  // Nuevo: Obtener todos los bloques disponibles de un médico para varios días
  getBloquesDisponiblesRango(idMedico: number, fechaInicio: string, fechaFin: string): Observable<BloqueHorarioDetallado[]> {
    return this.http.get<BloqueHorarioDetallado[]>(`${this.baseUrl}/disponibles-rango/${idMedico}/${fechaInicio}/${fechaFin}`);
  }
}

// Interfaces para los nuevos endpoints
export interface BloqueHorario {
  idBloque: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  idMedico: number;
}

export interface BloqueHorarioDetallado extends BloqueHorario {
  diaSemana: string;
  nombreMedico?: string;
  especialidad?: string;
}
