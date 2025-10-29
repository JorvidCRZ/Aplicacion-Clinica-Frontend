import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Usuario } from '../../models/users/usuario';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LoginResponse } from '../../models/users/login';
import { Rol } from '../../models/users/rol';

export type AuthState = {
  isLoggedIn: boolean;
  user: Usuario | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY_AUTH = 'auth';

  private authStateSubject = new BehaviorSubject<AuthState>({
    isLoggedIn: false,
    user: null
  });

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private router: Router, private http: HttpClient) {
    this.bootstrapFromStorage();
  }

  private bootstrapFromStorage(): void {
    const raw = localStorage.getItem(this.KEY_AUTH);
    const state: AuthState = raw ? JSON.parse(raw) : { isLoggedIn: false, user: null };
    this.authStateSubject.next(state);
  }

  private persistState(state: AuthState): void {
    const serialized = JSON.stringify(state);
    localStorage.setItem(this.KEY_AUTH, serialized);
    this.authStateSubject.next(state);
  }

  login(correo: string, contrasena: string): Observable<Usuario> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, contrasena }).pipe(
      map((response) => {
        const rolMap: Record<string, Rol> = {
          Administrador: { idRol: 1, nombre: 'Administrador' },
          Medico: { idRol: 2, nombre: 'Medico' },
          Paciente: { idRol: 3, nombre: 'Paciente' }
        };

        const fullName = this.buildFullNameFromLogin(response);

        const user: Usuario = {
          idUsuario: response.idUsuario,
          correo: response.correo,
          persona: {
            nombre: fullName,
            nombre1: (response as any).nombre1,
            nombre2: (response as any).nombre2,
            apellidoPaterno: (response as any).apellidoPaterno,
            apellidoMaterno: (response as any).apellidoMaterno
          } as any,
          rol: rolMap[response.rol] || { idRol: 0, nombre: 'Paciente' },
          token: (response as any).token || ''
        };

        this.persistState({ isLoggedIn: true, user });
        return user;
      })
    );
  }

  private buildFullNameFromLogin(response: LoginResponse): string {
    const nombre1 = (response as any).nombre1 || '';
    const nombre2 = (response as any).nombre2 || '';
    const apellidoPaterno = (response as any).apellidoPaterno || '';
    const apellidoMaterno = (response as any).apellidoMaterno || '';
    const full = [nombre1, nombre2, apellidoPaterno, apellidoMaterno]
      .filter(Boolean)
      .join(' ')
      .trim();
    return full || (response as any).nombre || (response as any).correo || '';
  }

  logout(): void {
    this.persistState({ isLoggedIn: false, user: null });
    localStorage.removeItem('redirectAfterLogin');
    this.router.navigate(['/login']);
  }

  get currentState(): AuthState {
    return this.authStateSubject.value;
  }

  get currentUser(): Usuario | null {
    return this.authStateSubject.value.user;
  }

  isLoggedIn(): boolean {
    return this.authStateSubject.value.isLoggedIn;
  }

  updateUser(data: Partial<Usuario>): void {
    const user = { ...this.currentUser, ...data } as Usuario;
    this.persistState({ isLoggedIn: true, user });
  }

  requireAuth(redirectTo?: string): boolean {
    if (this.isLoggedIn()) return true;
    if (redirectTo) localStorage.setItem('redirectAfterLogin', redirectTo);
    this.router.navigate(['/login']);
    return false;
  }

  getRedirectAfterLogin(): string | null {
    return localStorage.getItem('redirectAfterLogin');
  }

  clearRedirectAfterLogin(): void {
    localStorage.removeItem('redirectAfterLogin');
  }

  getUsuarioActual(): Usuario | null {
    return this.currentUser;
  }

  getUserIcon(): string {
    const rol = this.currentUser?.rol?.nombre?.toLowerCase();
    if (!rol) return 'fa-solid fa-user';

    switch (rol) {
      case 'administrador':
        return 'fa-solid fa-lock';
      case 'medico':
        return 'fa-solid fa-user-doctor';
      case 'paciente':
        return 'fa-solid fa-user';
      default:
        return 'fa-solid fa-user';
    }
  }


  getRoleDisplayName(): string {
    const nombre: any = this.currentUser?.rol?.nombre;
    if (!nombre) return '';
    if (typeof nombre === 'string') return nombre;
    if (typeof nombre === 'object') {
      return (
        nombre.nombre || nombre.es || nombre.en || nombre.value || JSON.stringify(nombre)
      );
    }
    return String(nombre);
  }


  getDisplayName(): string {
    const persona: any = this.currentUser?.persona;
    if (!persona) return this.currentUser?.correo || '';
    const parts = [persona.nombre1 || '', persona.apellidoPaterno || ''].filter(Boolean);
    if (parts.length > 0) return parts.join(' ').trim();
    return persona.nombre || this.currentUser?.correo || '';
  }

  redirectByRole(user: Usuario): void {
    const routeByRole: Record<string, string> = {
      administrador: '/admin/panel',
      medico: '/doctor/resumen',
      paciente: '/paciente/mi-resumen'
    };
    const destino = routeByRole[user.rol.nombre.toLowerCase()] || '/inicio';
    this.router.navigate([destino]);
  }
}

