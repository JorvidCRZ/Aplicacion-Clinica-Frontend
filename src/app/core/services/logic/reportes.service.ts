import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private base = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  private buildHeaders(): HttpHeaders {
    const raw = localStorage.getItem('auth');
    let token = '';
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      // Asumo que el token está en `parsed?.user?.token`
      token = parsed?.user?.token ?? ''; 
    } catch {
      token = '';
    }
    // Añade el header de autorización si el token existe
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private buildQuery(desde?: string, hasta?: string): string {
    const p = new URLSearchParams();
    if (desde) p.set('desde', desde);
    if (hasta) p.set('hasta', hasta);
    const q = p.toString();
    return q ? `?${q}` : '';
  }

  // ============== MÉTODOS EXISTENTES ==================

  descargarPacientes(formato: 'pdf' | 'excel' | 'csv', desde?: string, hasta?: string): Observable<Blob> {
    const url = `${this.base}/pacientes/${formato}${this.buildQuery(desde, hasta)}`;
    return this.http.get(url, { headers: this.buildHeaders(), responseType: 'blob' as 'blob' });
  }

  descargarMedicos(formato: 'pdf' | 'excel' | 'csv', desde?: string, hasta?: string): Observable<Blob> {
    const url = `${this.base}/medicos/${formato}${this.buildQuery(desde, hasta)}`;
    return this.http.get(url, { headers: this.buildHeaders(), responseType: 'blob' as 'blob' });
  }

  // Reporte de rendimiento de doctores (PDF) -> backend: /reportes/doctores-rendimiento/pdf
  descargarRendimientoDoctoresPDF(): Observable<Blob> {
    const url = `${this.base}/doctores-rendimiento/pdf`;
    return this.http.get(url, { headers: this.buildHeaders(), responseType: 'blob' as 'blob' });
  }

  // Reporte de estadísticas de pacientes (PDF) -> backend: /reportes/estadistica-pacientes/pdf
  descargarEstadisticaPacientesPDF(): Observable<Blob> {
    const url = `${this.base}/estadistica-pacientes/pdf`;
    return this.http.get(url, { headers: this.buildHeaders(), responseType: 'blob' as 'blob' });
  }

  descargarGeneralPDF(inicio?: string, fin?: string, topN: number = 5): Observable<Blob> {
    const params = new URLSearchParams();
    if (inicio) params.set('inicio', inicio);
    if (fin) params.set('fin', fin);
    if (topN !== undefined && topN !== null) params.set('topN', topN.toString());
    const url = `${this.base}/general/pdf${params.toString() ? '?' + params.toString() : ''}`;
    return this.http.get(url, { headers: this.buildHeaders(), responseType: 'blob' as 'blob' });
  }

  // Reporte de citas (PDF) -> backend: /reportes/citas/pdf
  descargarCitasPDF(): Observable<Blob> {
    const url = `${this.base}/citas/pdf`;
    return this.http.get(url, { headers: this.buildHeaders(), responseType: 'blob' as 'blob' });
  }

  descargarUsuariosPDF(): Observable<Blob> {
    const url = `${this.base}/usuarios/pdf`;
    return this.http.get(url, { headers: this.buildHeaders(), responseType: 'blob' as 'blob' });
  }

  // ============== NUEVO MÉTODO PARA REPORTE DE PAGO PDF ==================

  /**
   * Obtiene el reporte de pago en formato PDF.
   * 
   * @param idPago 
   * @returns 
   */
  descargarReportePago(idPago: string): Observable<Blob> {
    const url = `${this.base}/facturas/pdf/${idPago}`; // <-- URL del endpoint de ReporteController
    
    return this.http.get(url, { 
      headers: this.buildHeaders(), 
      responseType: 'blob' as 'blob' // Clave para manejar archivos binarios
    });
  }
}