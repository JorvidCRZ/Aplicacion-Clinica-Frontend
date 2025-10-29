import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Especialidad {
    idEspecialidad: number;
    nombre: string;
    descripcion: string;
    urlImgIcono: string;
    urlImgPort: string;
    descripcionPortada: string;
}

@Injectable({
    providedIn: 'root'
})
export class EspecialidadService {
    private URL = `${environment.apiUrl}/especialidades`;
    private http = inject(HttpClient);

    getEspecialidades(): Observable<Especialidad[]> {
        return this.http.get<Especialidad[]>(this.URL);
    }

    getEspecialidad(id: number): Observable<Especialidad> {
        return this.http.get<Especialidad>(`${this.URL}/${id}`);
    }

    crearEspecialidad(especialidad: Especialidad): Observable<Especialidad> {
        return this.http.post<Especialidad>(this.URL, especialidad);
    }

    actualizarEspecialidad(id: number, especialidad: Especialidad): Observable<Especialidad> {
        return this.http.put<Especialidad>(`${this.URL}/${id}`, especialidad);
    }

    eliminarEspecialidad(id: number): Observable<void> {
        return this.http.delete<void>(`${this.URL}/${id}`);
    }
}