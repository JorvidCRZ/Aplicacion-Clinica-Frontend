import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../models/users/usuario';

export type AuthState = {
  isLoggedIn: boolean;
  user: Usuario | null;
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
    localStorage.setItem(this.KEY_AUTH, JSON.stringify(state));
    this.authStateSubject.next(state);
  }

  // 🔹 Login con un usuario
  login(user: Usuario): void {
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
  get currentUser(): Usuario | null {
    return this.authStateSubject.value.user;
  }

  // 🔹 Comprueba si está logueado
  isLoggedIn(): boolean {
    return this.authStateSubject.value.isLoggedIn;
  }

  // 🔹 Actualiza parcialmente los datos del usuario
  updateUser(data: Partial<Usuario>): void {
    const user = { ...this.currentUser, ...data } as Usuario;
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
