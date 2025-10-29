import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Subespecialidad {
    idSubespecialidad: number;
    idEspecialidad: number;
    nombre: string;
    descripcion: string;
    urlImg: string;
    precioSubespecial: number;
}

@Injectable({
    providedIn: 'root'
})
export class SubespecialidadService {
    private URL = `${environment.apiUrl}/subespecialidades`;
    private http = inject(HttpClient);

    getSubespecialidadesPorEspecialidad(idEspecialidad: number): Observable<Subespecialidad[]> {
        return this.http.get<Subespecialidad[]>(`${this.URL}/subespecialidad/${idEspecialidad}`);
    }
}
