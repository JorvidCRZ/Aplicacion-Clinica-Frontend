import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/rol/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const usuario = this.authService.getUsuarioActual();
    const rolesPermitidos = route.data['roles'] as string[];

    if (!usuario) {
      return this.router.parseUrl('/login');
    }

    // 🔸 Accedemos al nombre del rol desde el objeto
    const rolUsuario = usuario.rol?.nombre?.toLowerCase();

    if (!rolUsuario) {
      return this.router.parseUrl('/login');
    }

    // 🔸 Comparamos con los roles permitidos (en minúsculas por seguridad)
    const rolesValidos = rolesPermitidos.map(r => r.toLowerCase());
    if (!rolesValidos.includes(rolUsuario)) {
      // 🔸 Redirigir al dashboard correspondiente si intenta acceder a otra ruta
      switch (rolUsuario) {
        case 'administrador':
          return this.router.parseUrl('/admin');
        case 'medico':
          return this.router.parseUrl('/doctor');
        case 'paciente':
          return this.router.parseUrl('/paciente');
        default:
          return this.router.parseUrl('/login');
      }
    }

    return true;
  }
}
