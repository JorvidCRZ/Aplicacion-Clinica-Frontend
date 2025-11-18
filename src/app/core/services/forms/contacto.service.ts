import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Contacto } from '../../models/common/contacto';

@Injectable({ providedIn: 'root' })
export class ContactoService {
  private http = inject(HttpClient);

  crear(contacto: Contacto & { idUsuario?: number }): Observable<any> {
    const dto: any = {
      nombre: contacto.nombre,
      correo: contacto.correo,
      telefono: contacto.telefono ?? undefined,
      tipoConsulta: contacto.tipoConsulta ?? undefined,
      asunto: contacto.asunto ?? undefined,
      mensaje: contacto.mensaje,
      idUsuario: contacto.idUsuario
    };

    return this.http.post<any>(`${environment.apiUrl}/contactos`, dto);
  }
}
