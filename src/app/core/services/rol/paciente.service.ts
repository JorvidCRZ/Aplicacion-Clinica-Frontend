import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../../models/users/paciente';
import { Persona } from '../../models/users/persona';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PacienteService {


  private apiUrl = `${environment.apiUrl}/pacientes`;
  private apiUrlUsuario = `${environment.apiUrl}/usuarios`;
  private apiUrlPersona = `${environment.apiUrl}/personas`;

  constructor(
    private http: HttpClient) { }

  getAll(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  getById(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}`);
  }

  add(paciente: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl, paciente);
  }

  update(idPaciente: number, paciente: Paciente): Observable<Paciente> {
    const body = {
      idPersona: paciente.persona?.idPersona ?? null, // backend requiere idPersona > 0
      tipoSangre: paciente.tipoSangre ?? null,
      peso: paciente.peso ?? null,
      altura: paciente.altura ?? null,
      contactoEmergenciaNombre: paciente.contactoEmergenciaNombre ?? null,
      contactoEmergenciaRelacion: paciente.contactoEmergenciaRelacion ?? null,
      contactoEmergenciaTelefono: paciente.contactoEmergenciaTelefono ?? null,

      persona: {
        tipoDocumento: paciente.persona?.tipoDocumento ?? null,
        nombre1: paciente.persona?.nombre1 ?? null,
        nombre2: paciente.persona?.nombre2 ?? null,
        apellidoPaterno: paciente.persona?.apellidoPaterno ?? null,
        apellidoMaterno: paciente.persona?.apellidoMaterno ?? null,
        dni: paciente.persona?.dni ?? null,
        fechaNacimiento: paciente.persona?.fechaNacimiento
          ? new Date(paciente.persona!.fechaNacimiento).toISOString()
          : null,
        genero: paciente.persona?.genero ?? null,
        pais: paciente.persona?.pais ?? null,
        departamento: paciente.persona?.departamento ?? null,
        provincia: paciente.persona?.provincia ?? null,
        distrito: paciente.persona?.distrito ?? null,
        direccion: paciente.persona?.direccion ?? null,
        telefono: paciente.persona?.telefono ?? null
      },

      usuarioAgrego: {
        idUsuario: (paciente as any).usuario?.idUsuario ?? null,
        correo: (paciente as any).usuario?.correo ?? (paciente as any).usuario?.email ?? null,
        telefono: (paciente as any).usuario?.telefono ?? null
      }
    };

    return this.http.put<Paciente>(`${this.apiUrl}/${idPaciente}`, body);
  }



  updateUsuario(idUsuario: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrlUsuario}/${idUsuario}`, data);
  }

  updatePersona(idPersona: number, persona: Persona): Observable<Persona> {
    return this.http.put<Persona>(`${this.apiUrlPersona}/${idPersona}`, persona);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByUsuario(idUsuario: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  // Obtener pacientes en formato de tabla para un médico (endpoint específico de UI)
  obtenerPacientesPorMedico(idMedico: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tablapacientes/medico/${idMedico}`);
  }
    // Obtener puntualidad del médico (porcentaje o métrica) — endpoint añadido
  obtenerPuntualidadPorMedico(idMedico: number): Observable<{ puntualidad: number }> {
    return this.http.get<{ puntualidad: number }>(`${this.apiUrl}/puntualidad/medico/${idMedico}`);
  }

  // Obtener satisfacción del médico (porcentaje o métrica)
  obtenerSatisfaccionPorMedico(idMedico: number): Observable<{ satisfaccion: number }> {
    return this.http.get<{ satisfaccion: number }>(`${this.apiUrl}/satisfaccion/medico/${idMedico}`);
  }
}
