import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin } from '../../models/users/admin';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
    private apiUrl = `${environment.apiUrl}/admin`;

    constructor(private http: HttpClient) { }


    crear(request: Admin): Observable<Admin> {
        return this.http.post<Admin>(this.apiUrl, request);
    }

    listar(): Observable<Admin[]> {
        return this.http.get<Admin[]>(this.apiUrl);
    }

    obtenerPorId(id: number): Observable<Admin> {
        return this.http.get<Admin>(`${this.apiUrl}/${id}`);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

}