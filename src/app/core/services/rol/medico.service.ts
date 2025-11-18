import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico } from '../../models/users/medico';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private apiUrl = `${environment.apiUrl}/medicos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.apiUrl);
  }

  getById(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.apiUrl}/${id}`);
  }

  add(medico: Medico): Observable<Medico> {
    return this.http.post<Medico>(this.apiUrl, medico);
  }

  update(id: number, medico: Medico): Observable<Medico> {
    return this.http.put<Medico>(`${this.apiUrl}/${id}`, medico);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`); 
  }
  getMedicos(): Observable<any> {
  return this.http.get(this.apiUrl);
}

}

