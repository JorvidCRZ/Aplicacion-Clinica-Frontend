import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudHorarioRequest, SolicitudHorarioResponse, AprobarSolicitudRequest } from '../../models/common/solicitud-horario';

@Injectable({
  providedIn: 'root'
})
export class SolicitudHorarioService {
  private apiUrl = 'http://localhost:8080/api/solicitudes-horario';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
   
    const authState = JSON.parse(localStorage.getItem('auth') || '{}');
    const usuario = authState.user || {};
    
    return new HttpHeaders().set('X-Usuario-Id', (usuario.idUsuario || '').toString());
  }


  crearSolicitud(request: SolicitudHorarioRequest): Observable<SolicitudHorarioResponse> {
    return this.http.post<SolicitudHorarioResponse>(this.apiUrl, request, { headers: this.getHeaders() });
  }

  obtenerMisSolicitudes(): Observable<SolicitudHorarioResponse[]> {
    return this.http.get<SolicitudHorarioResponse[]>(`${this.apiUrl}/mis-solicitudes`, { headers: this.getHeaders() });
  }


  obtenerPendientes(): Observable<SolicitudHorarioResponse[]> {
    return this.http.get<SolicitudHorarioResponse[]>(`${this.apiUrl}/pendientes`, { headers: this.getHeaders() });
  }

  aprobarSolicitud(id: number, request: AprobarSolicitudRequest): Observable<SolicitudHorarioResponse> {
    return this.http.post<SolicitudHorarioResponse>(`${this.apiUrl}/${id}/aprobar`, request, { headers: this.getHeaders() });
  }
}