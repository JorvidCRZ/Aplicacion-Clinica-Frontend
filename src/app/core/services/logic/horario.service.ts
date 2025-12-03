import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HorariosMedicoResponse } from '../../models/common/cita';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  // Nuevo: Obtener todas las disponibilidades (resumen) -- endpoint /disponibilidades
  getDisponibilidades(): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(`${this.baseUrl}/disponibilidades`);
  }

  // Nuevo: Obtener bloques por día para un médico.
  // Si se pasa `fecha` se añade como query param `?fecha=YYYY-MM-DD`.
  getBloquesPorDia(idMedico: number, fecha?: string): Observable<BloquesPorDia[]> {
    let url = `${this.baseUrl}/medicos/${idMedico}/bloques-por-dia`;
    if (fecha) url += `?fecha=${fecha}`;
    return this.http.get<BloquesPorDia[]>(url);
  }

  // Nuevo: Activar o desactivar bloques (cambiar disponibilidad) para un médico
  // Envía un objeto con la propiedad `estado` (boolean) porque el backend espera un valor booleano.
  activarBloques(idMedico: number, estado: boolean = true): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/medico/${idMedico}/activar-bloques`, { estado });
  }

  // Nuevo: Llamar al endpoint real para poner disponibles los bloques
  ponerDisponibles(idMedico: number): Observable<void> {
    // Algunos endpoints devuelven 200 con body vacío o con Content-Type no-JSON.
    // Para evitar "Http failure during parsing" forzamos responseType: 'text'
    return this.http.put(`${this.baseUrl}/medico/${idMedico}/poner-disponibles`, {}, { responseType: 'text' })
      .pipe(map(() => undefined));
  }

  // Nuevo: Establecer disponibilidad (true/false) mediante query param
  // PUT /horario-bloque/medico/{idMedico}/disponibilidad?disponible={true|false}
  setDisponibilidad(idMedico: number, disponible: boolean): Observable<void> {
    const url = `${this.baseUrl}/medico/${idMedico}/disponibilidad?disponible=${disponible}`;
    return this.http.put(url, {}, { responseType: 'text' }).pipe(map(() => undefined));
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

// Interface para el endpoint /disponibilidades
export interface Disponibilidad {
  id: number;
  medico: string;
  especialidad: string;
  dias: string; // ejemplo: "Domingo, Miércoles, Viernes"
  horaInicio: string; // formato HH:MM:SS
  horaFin: string;    // formato HH:MM:SS
  duracion: number;   // minutos por bloque
  bloques: number;    // cantidad total de bloques (según el backend)
  estado: string;     // ejemplo: "No disponible" | "Disponible"
}

// Interfaces para Bloques por Día
export interface BloqueDia {
  horaInicio: string; // HH:MM:SS
  horaFin: string;    // HH:MM:SS
}

export interface BloquesPorDia {
  fecha: string; // YYYY-MM-DD
  dia: string;   // nombre del día, p.ej. "Jueves"
  bloques: BloqueDia[];
}
