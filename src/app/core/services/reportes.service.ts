import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private base = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  private buildHeaders(): HttpHeaders {
    const raw = localStorage.getItem('auth');
    let token = '';
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      token = parsed?.user?.token ?? '';
    } catch {
      token = '';
    }
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private buildQuery(desde?: string, hasta?: string): string {
    const p = new URLSearchParams();
    if (desde) p.set('desde', desde);
    if (hasta) p.set('hasta', hasta);
    const q = p.toString();
    return q ? `?${q}` : '';
  }

  descargarPacientes(formato: 'pdf' | 'excel' | 'csv', desde?: string, hasta?: string): Observable<Blob> {
    const url = `${this.base}/pacientes/${formato}${this.buildQuery(desde, hasta)}`;
    return this.http.get(url, { headers: this.buildHeaders(), responseType: 'blob' as 'blob' });
  }

  descargarMedicos(formato: 'pdf' | 'excel' | 'csv', desde?: string, hasta?: string): Observable<Blob> {
    const url = `${this.base}/medicos/${formato}${this.buildQuery(desde, hasta)}`;
    return this.http.get(url, { headers: this.buildHeaders(), responseType: 'blob' as 'blob' });
  }
}
