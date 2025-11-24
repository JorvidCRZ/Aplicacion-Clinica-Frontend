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
    
    const body: any = {
      idPersona: paciente.persona?.idPersona,
      tipoSangre: paciente.tipoSangre,
      peso: paciente.peso,
      altura: paciente.altura,
      contactoEmergenciaNombre: paciente.contactoEmergenciaNombre,
      contactoEmergenciaRelacion: paciente.contactoEmergenciaRelacion,
      contactoEmergenciaTelefono: paciente.contactoEmergenciaTelefono
    };

    if (paciente.persona) {
      body.persona = {
        tipoDocumento: paciente.persona.tipoDocumento,
        nombre1: paciente.persona.nombre1,
        nombre2: paciente.persona.nombre2,
        apellidoPaterno: paciente.persona.apellidoPaterno,
        apellidoMaterno: paciente.persona.apellidoMaterno,
        dni: paciente.persona.dni,
        fechaNacimiento: paciente.persona.fechaNacimiento,
        genero: paciente.persona.genero,
        pais: paciente.persona.pais,
        departamento: paciente.persona.departamento,
        provincia: paciente.persona.provincia,
        distrito: paciente.persona.distrito,
        direccion: paciente.persona.direccion,
        telefono: paciente.persona.telefono
      };
    }

    if (paciente.usuario?.idUsuario && paciente.usuario?.correo) {
      body.usuario = {
        idUsuario: paciente.usuario.idUsuario,
        correo: paciente.usuario.correo
      };
    }

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
