import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactoService {
  private http = inject(HttpClient);

  crear(contacto: { nombre: string; correo: string; telefono?: string; asunto?: string; tipoConsulta?: string; mensaje: string; idUsuario?: number | undefined }) {
    const dto: any = {
      nombre: contacto.nombre,
      correo: contacto.correo,
      telefono: contacto.telefono ?? undefined,
      tipoConsulta: contacto.tipoConsulta ?? undefined,
      asunto: contacto.asunto ?? undefined,
      mensaje: contacto.mensaje,
      idUsuario: contacto.idUsuario
    };

    return this.http.post<any>(`${environment.apiBaseUrl}/contactos`, dto);
  }
}
