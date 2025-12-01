import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MedicosService {

  private http = inject(HttpClient);
  private URL = `${environment.apiUrl}/medicos`;

  obtenerDisponibilidad(idMedico: number): Observable<any> {
    return this.http.get(`${this.URL}/${idMedico}/disponibilidad`);
  }

  obtenerMedicoPorUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${this.URL}/usuario/${idUsuario}`);
  }

  eliminarHorario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.URL}/disponibilidad/${id}`);
  }

  crearDisponibilidad(horarios: any): Observable<any> {
    return this.http.post(`${this.URL}/disponibilidad`, horarios);
  }

  obtenerEspecialidadPorMedico(idMedico: number): Observable<{ nombreEspecialidad: string }> {
    return this.http.get<{ nombreEspecialidad: string }>(
      `${this.URL}/especialidad/${idMedico}`
    );
  }

  obtenerPerfilMedico(idMedico: number): Observable<any> {
    return this.http.get(`${this.URL}/perfil/${idMedico}`);
  }

  actualizarPerfilMedico(idMedico: number, perfilData: any): Observable<any> {
    return this.http.put(`${this.URL}/perfil/actualizar/${idMedico}`, perfilData);
  }
}
