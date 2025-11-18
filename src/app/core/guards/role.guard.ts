import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const rolesPermitidos = route.data['roles'] as string[] | undefined;

    const usuario = this.authService.currentUser;
    if (!this.authService.isLoggedIn() || !usuario) {
      return this.router.parseUrl('/login');
    }

    const userRoleKey = this.normalizeRoleKey((usuario.rol?.nombre || '').toString());

    if (!rolesPermitidos || rolesPermitidos.length === 0) {
      return true;
    }

    const allowedKeys = rolesPermitidos.map(r => this.normalizeRoleKey(String(r)));
    if (allowedKeys.includes(userRoleKey)) {
      return true;
    }

    const routeByRole: Record<string, string> = {
      admin: '/admin',
      medico: '/medico',
      paciente: '/paciente'
    };
    return this.router.parseUrl(routeByRole[userRoleKey] || '/login');
  }

  private normalizeRoleKey(raw: string): 'admin' | 'medico' | 'paciente' | string {
    let r = raw.toLowerCase().trim();
    r = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (r.includes('admin')) return 'admin';
    if (r.includes('medic') || r.includes('medico') || r.includes('doctor')) return 'medico';
    if (r.includes('pacient') || r.includes('paciente')) return 'paciente';
    return r;
  }
}
