import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../models/users/usuario'; 

type AuthState = { isLoggedIn: boolean; user: Usuario | null };

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Claves de storage (compat con código de tu equipo)
  private readonly KEY_LOGGED = 'logueado';
  private readonly KEY_USER_ACTIVE = 'usuarioActivo'; // versión compañeros
  private readonly KEY_USER_LEGACY = 'usuario';       // versión antigua tuya
  private readonly KEY_REDIRECT = 'redirectAfterLogin';

  // Estado reactivo 1: solo usuario (compat con tu header actual)
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Estado reactivo 2: isLoggedIn + user (compat con la versión de tus compañeros)
  private authStateSubject = new BehaviorSubject<AuthState>({ isLoggedIn: false, user: null });
  public authState$ = this.authStateSubject.asObservable();

  constructor(private router: Router) {
    this.createDefaultAdmin();
    this.bootstrapFromStorage();
  }

  /** Crea un usuario admin predeterminado si no existe */
  private createDefaultAdmin(): void {
    const adminEmail = 'admin@admin.com';
    const adminUser = {
      id: 1,
      nombre: 'Administrador',
      email: adminEmail,
      telefono: '999999999',
      password: 'admin123',
      rol: 'admin'
    };
    // Solo crear si no existe ningún usuario admin en storage
    const raw = localStorage.getItem(this.KEY_USER_ACTIVE) ?? localStorage.getItem(this.KEY_USER_LEGACY);
    if (!raw) {
      localStorage.setItem(this.KEY_USER_ACTIVE, JSON.stringify(adminUser));
      localStorage.setItem(this.KEY_LOGGED, 'false');
    }
  }

  /** Lee de localStorage (incluye compat con claves antiguas) y sincroniza estado */
  private bootstrapFromStorage(): void {
    const isLoggedIn = localStorage.getItem(this.KEY_LOGGED) === 'true';

    // Prioridad: usuarioActivo (nuevo) > usuario (legacy)
    const rawUser = localStorage.getItem(this.KEY_USER_ACTIVE) ?? localStorage.getItem(this.KEY_USER_LEGACY);
    const parsed = rawUser ? this.safeParse(rawUser) : null;

    const user = parsed ? this.normalizeUser(parsed) : null;

    // Si hay discrepancia entre logged y user, arreglar
    if (isLoggedIn && !user) {
      // Usuario faltante: desloguear coherentemente
      this.persistAuth(false, null);
      this.pushState(false, null);
      return;
    }

    // Migrar a clave nueva (opcional): guardamos en usuarioActivo
    if (user && localStorage.getItem(this.KEY_USER_ACTIVE) == null) {
      localStorage.setItem(this.KEY_USER_ACTIVE, JSON.stringify(user));
      localStorage.removeItem(this.KEY_USER_LEGACY);
    }

    this.pushState(isLoggedIn, user);
  }

  /** Normaliza cualquier objeto a Usuario válido (crea id si falta) */
  private normalizeUser(u: any): Usuario {
    const id: number =
      typeof u?.id === 'number' ? u.id :
      Number(localStorage.getItem('usuario_id_seq')) ||
      Date.now();

    // si generamos id por primera vez, dejamos una semilla sencilla
    if (typeof u?.id !== 'number') {
      localStorage.setItem('usuario_id_seq', String(id));
    }

    const user: Usuario = {
      id,
      nombre: u?.nombre ?? u?.name ?? 'Usuario',
      email: u?.email ?? 'sin-correo@example.com',
      telefono: u?.telefono ?? u?.phone ?? '',
      password: u?.password ?? '',
      rol: u?.rol ?? 'user'
    };
    return user;
  }

  private safeParse(str: string): any | null {
    try { return JSON.parse(str); } catch { return null; }
  }

  /** Persiste login + usuario en storage coherente */
  private persistAuth(isLoggedIn: boolean, user: Usuario | null): void {
    localStorage.setItem(this.KEY_LOGGED, String(isLoggedIn));
    if (user) {
      localStorage.setItem(this.KEY_USER_ACTIVE, JSON.stringify(user));
      localStorage.removeItem(this.KEY_USER_LEGACY); // limpiamos legacy
    } else {
      localStorage.removeItem(this.KEY_USER_ACTIVE);
    }
  }

  /** Emite a ambos subjects para mantener compatibilidad */
  private pushState(isLoggedIn: boolean, user: Usuario | null): void {
    this.currentUserSubject.next(user);
    this.authStateSubject.next({ isLoggedIn, user });
  }

  /** Sincroniza desde storage hacia subjects */
  private updateAuthState(): void {
    const isLogged = this.isLoggedIn();
    const user = this.getCurrentUser();
    this.pushState(isLogged, user);
  }

  // ----------------- API pública -----------------

  isLoggedIn(): boolean {
    return localStorage.getItem(this.KEY_LOGGED) === 'true';
  }

  getCurrentUser(): Usuario | null {
    const str = localStorage.getItem(this.KEY_USER_ACTIVE) ?? localStorage.getItem(this.KEY_USER_LEGACY);
    return str ? this.normalizeUser(this.safeParse(str)) : null;
  }

  /** Permite login con un objeto "libre" (registro manual, formularios diversos) */
  loginWithLocalUser(user: any): void {
    const normalized = this.normalizeUser(user);
    this.persistAuth(true, normalized);
    this.updateAuthState();
  }

  /** Login directo cuando ya tienes un Usuario o parcial (compat con componentes) */
  setLoggedIn(user: any): void {
    const normalized = this.normalizeUser(user);
    this.persistAuth(true, normalized);
    this.updateAuthState();
  }

  /** Protege rutas; si no está logueado, guarda redirect y navega a /login */
  requireAuth(redirectTo?: string): boolean {
    if (this.isLoggedIn()) return true;
    if (redirectTo) localStorage.setItem(this.KEY_REDIRECT, redirectTo);
    this.router.navigate(['/login']);
    return false;
  }

  getRedirectAfterLogin(): string | null {
    return localStorage.getItem(this.KEY_REDIRECT);
  }

  clearRedirectAfterLogin(): void {
    localStorage.removeItem(this.KEY_REDIRECT);
  }

  /** Actualización parcial del usuario (perfil) */
  updateUser(userData: Partial<Usuario>): void {
    const current = this.getCurrentUser();
    if (!current) return;
    const updated = this.normalizeUser({ ...current, ...userData });
    this.persistAuth(true, updated);
    this.updateAuthState();
  }

  /** Cierra sesión y redirige a /login */
  logout(): void {
    this.persistAuth(false, null);
    this.clearRedirectAfterLogin();
    this.updateAuthState();
    this.router.navigate(['/login']);
  }
}

