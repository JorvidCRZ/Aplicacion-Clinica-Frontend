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

  getHorariosPorMedico(idMedico: number): Observable<HorariosMedicoResponse> {
    return this.http.get<HorariosMedicoResponse>(`${this.baseUrl}/medico/${idMedico}`);
  }
}
