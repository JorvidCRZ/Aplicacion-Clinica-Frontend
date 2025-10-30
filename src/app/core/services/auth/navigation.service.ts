import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthNavigationService {
    constructor(private router: Router, private auth: AuthService) { }

    requireAuth(redirectTo?: string): boolean {
        if (this.auth.isLoggedIn()) return true;
        if (redirectTo) localStorage.setItem('redirectAfterLogin', redirectTo);
        this.router.navigate(['/login']);
        return false;
    }

    redirectByRole(): void {
        const user = this.auth.currentUser;
        if (!user) {
            this.router.navigate(['/login']);
            return;
        }

        const routeByRole: Record<string, string> = {
            administrador: '/admin/panel',
            medico: '/medico/resumen',
            paciente: '/paciente/mi-resumen',
        };

        const rolName = user.rol.nombre.toLowerCase();
        const destino = routeByRole[rolName] || '/inicio';
        this.router.navigate([destino]);
    }

    getRedirectAfterLogin(): string | null {
        return localStorage.getItem('redirectAfterLogin');
    }

    clearRedirectAfterLogin(): void {
        localStorage.removeItem('redirectAfterLogin');
    }
}
