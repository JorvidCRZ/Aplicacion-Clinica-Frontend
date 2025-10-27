import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../../models/users/usuario';
import { Doctor } from '../../models/users/doctor';
import { Admin } from '../../models/users/admin';
import { Paciente } from '../../models/users/paciente';

export type AuthState = {
  isLoggedIn: boolean;
  user: Usuario | Doctor | Admin | Paciente | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY_AUTH = 'auth'; // 🔹 Única clave en localStorage

  private authStateSubject = new BehaviorSubject<AuthState>({
    isLoggedIn: false,
    user: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private router: Router) {
    this.bootstrapFromStorage();
  }

  // 🔹 Inicializa desde localStorage
  private bootstrapFromStorage(): void {
    const raw = localStorage.getItem(this.KEY_AUTH);
    const state: AuthState = raw ? JSON.parse(raw) : { isLoggedIn: false, user: null };
    this.authStateSubject.next(state);
  }

  // 🔹 Obtiene el icono según el rol del usuario
  getUserIcon(): string {
    const rol = this.currentUser?.rol;
    if (!rol) return 'fa-solid fa-user'; 

    switch (rol) {
      case 'admin': return 'fa-solid fa-lock';
      case 'doctor': return 'fa-solid fa-user-doctor';
      case 'paciente': return 'fa-solid fa-user';
      default: return 'fa-solid fa-user';
    }
  }

  // 🔹 Persiste estado en localStorage y BehaviorSubject
  private persistState(state: AuthState): void {
    const serialized = JSON.stringify(state);
    localStorage.setItem(this.KEY_AUTH, serialized);
    this.authStateSubject.next(state);
  }

  // 🔹 Login con un usuario
  login(user: Usuario | Doctor | Admin | Paciente): void {
    this.persistState({ isLoggedIn: true, user });
  }

  // 🔹 Logout
  logout(): void {
    this.persistState({ isLoggedIn: false, user: null });
    this.router.navigate(['/login']);
  }

  // 🔹 Devuelve el estado actual
  get currentState(): AuthState {
    return this.authStateSubject.value;
  }

  // 🔹 Devuelve el usuario actual
  get currentUser(): Usuario | Doctor | Admin | Paciente | null {
    const user = this.authStateSubject.value.user;
    return user;
  }

  // 🔹 Comprueba si está logueado
  isLoggedIn(): boolean {
    return this.authStateSubject.value.isLoggedIn;
  }

  // 🔹 Actualiza parcialmente los datos del usuario
  updateUser(data: Partial<Usuario | Doctor | Admin | Paciente>): void {
    const user = { ...this.currentUser, ...data } as Usuario | Doctor | Admin | Paciente;
    this.persistState({ isLoggedIn: true, user });
  }

  // 🔹 Protege rutas
  requireAuth(redirectTo?: string): boolean {
    if (this.isLoggedIn()) return true;
    if (redirectTo) localStorage.setItem('redirectAfterLogin', redirectTo);
    this.router.navigate(['/login']);
    return false;
  }

  // 🔹 Devuelve la ruta guardada para redirección
  getRedirectAfterLogin(): string | null {
    return localStorage.getItem('redirectAfterLogin');
  }

  clearRedirectAfterLogin(): void {
    localStorage.removeItem('redirectAfterLogin');
  }
}
