import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notificacion } from '../../models/common/notificacion';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = 'http://localhost:8080/api/notificaciones'; 

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {

    const authState = JSON.parse(localStorage.getItem('auth') || '{}');
    const usuario = authState.user || {};
    
    const usuarioId = usuario.idUsuario || '';
    
    return new HttpHeaders().set('X-Usuario-Id', usuarioId.toString());
  }

  obtenerNoLeidas(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/no-leidas`, { headers: this.getHeaders() });
  }

  marcarComoLeida(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/marcar-leida`, {}, { headers: this.getHeaders() });
  }
  
  contarNoLeidas(): Observable<{ contador: number }> {
    return this.http.get<{ contador: number }>(`${this.apiUrl}/contador-no-leidas`, { headers: this.getHeaders() });
  }
}