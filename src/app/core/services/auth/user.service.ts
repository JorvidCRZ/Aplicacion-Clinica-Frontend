import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Usuario } from '../../models/users/usuario';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private auth: AuthService) { }

    get current() { return this.auth.currentUser; }

    getCorreoUsuarioActual(): string | undefined { return this.current?.correo; }

    getIdUsuario(): number { return this.current?.idUsuario || 0; }

    getDisplayName(): string {
        const persona = this.current?.persona;
        if (!persona) return this.current?.correo || '';
        const parts = [persona.nombre1 || '', persona.apellidoPaterno || ''].filter(Boolean);
        return parts.join(' ').trim() || persona.nombre1 || this.current?.correo || '';
    }

    getRoleDisplayName(): string {
        return this.current?.rol?.nombre || '';
    }

    getUserIcon(): string {
        const role = this.current?.rol?.nombre.toLowerCase();
        if (role === 'administrador') return 'fa-solid fa-lock';
        if (role === 'medico') return 'fa-solid fa-user-doctor';
        return 'fa-solid fa-user';
    }

    updateLocalUser(data: Partial<Usuario>) {
        this.auth.updateUser(data);
    }
}
