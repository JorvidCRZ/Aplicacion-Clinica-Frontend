import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Usuario } from '../../models/users/usuario';
import { Rol } from '../../models/users/rol';
import { LoginResponse } from '../../models/users/login';
import { MENU_DASHBOARD } from '../../config/menu-dasboard.config';
import { MenuItem } from '../../models/common/menu-items';

export type AuthState = {
  isLoggedIn: boolean;
  user: Usuario | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY_AUTH = 'auth';
  private apiUrl = `${environment.apiUrl}/auth`;

  private authStateSubject = new BehaviorSubject<AuthState>({
    isLoggedIn: false,
    user: null,
  });

  constructor(private http: HttpClient, private router: Router) {
    this.bootstrapFromStorage();
  }

  private bootstrapFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.KEY_AUTH);
      const state: AuthState = raw ? JSON.parse(raw) : { isLoggedIn: false, user: null };
      this.authStateSubject.next(state);
    } catch {
      this.authStateSubject.next({ isLoggedIn: false, user: null });
    }
  }

  private persistState(state: AuthState): void {
    localStorage.setItem(this.KEY_AUTH, JSON.stringify(state));
    this.authStateSubject.next(state);
  }

  private normalizeRole(rawRole: string): 'Administrador' | 'Medico' | 'Paciente' {
    const r = rawRole?.toLowerCase().trim();
    if (r.includes('admin')) return 'Administrador';
    if (r.includes('medic')) return 'Medico';
    return 'Paciente';
  }

  login(correo: string, contrasena: string): Observable<Usuario> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, contrasena }).pipe(
      map((response) => {
        const rolMap: Record<'Administrador' | 'Medico' | 'Paciente', Rol> = {
          Administrador: { idRol: 1, nombre: 'Administrador' },
          Medico: { idRol: 2, nombre: 'Medico' },
          Paciente: { idRol: 3, nombre: 'Paciente' },
        };

        const user: Usuario = {
          idUsuario: response.idUsuario,
          correo: response.correo,
          persona: {
            nombre: `${response.nombre1 ?? ''} ${response.apellidoPaterno ?? ''}`.trim(),
            nombre1: response.nombre1,
            nombre2: response.nombre2,
            apellidoPaterno: response.apellidoPaterno,
            apellidoMaterno: response.apellidoMaterno,
          } as any,
          rol: rolMap[this.normalizeRole(response.rol)],
          token: response.token ?? '',
        };

        this.persistState({ isLoggedIn: true, user });
        return user;
      })
    );
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

  // Exponer estado como observable para reactividad opcional en componentes
  public readonly authState$ = this.authStateSubject.asObservable();

  // Normaliza el rol del usuario actual a las claves del menú: 'admin' | 'medico' | 'paciente'
  private getRoleKey(): 'admin' | 'medico' | 'paciente' {
    const nombre = this.currentUser?.rol?.nombre?.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') || '';
    switch (true) {
      case nombre.includes('admin'):
        return 'admin';
      case nombre.includes('medic') || nombre.includes('doctor'):
        return 'medico';
      default:
        return 'paciente';
    }
  }

  // Devuelve los enlaces de cuenta para el header según el rol actual usando switch
  getAccountLinks(): MenuItem[] {
    if (!this.isLoggedIn() || !this.currentUser) return [];

    const key = this.getRoleKey();
    switch (key) {
      case 'admin':
        return MENU_DASHBOARD['admin'] || [];
      case 'medico':
        return MENU_DASHBOARD['medico'] || [];
      case 'paciente':
      default:
        return MENU_DASHBOARD['paciente'] || [];
    }
  }
}
