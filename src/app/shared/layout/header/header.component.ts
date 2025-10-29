import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/rol/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LogoComponent } from './logo/logo.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AccountMenuComponent } from './account-menu/account-menu.component';
import { MENU_PUBLIC } from '../../../core/config/menu-public.config';
import { MENU_DASHBOARD } from '../../../core/config/menu-dasboard.config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent, NavbarComponent, AccountMenuComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menuItems = MENU_PUBLIC;

  constructor(public authService: AuthService) { }

  get accountLinks() {
    if (!this.authService.isLoggedIn()) return [];

    const rolNombre = this.authService.getRoleDisplayName().toLowerCase() || '';

    switch (rolNombre) {
      case 'administrador':
        return MENU_DASHBOARD['admin'];
      case 'medico':
        return MENU_DASHBOARD['doctor'];
      case 'paciente':
        return MENU_DASHBOARD['paciente'];
      default:
        return [];
    }
  }

  get logueado(): boolean {
    return this.authService.isLoggedIn();
  }

  get nombreUsuario(): string | null {
    return this.authService.getDisplayName() || null;
  }

  get userEmail(): string | null {
    return this.authService.currentUser?.correo || null;
  }

  get isAdmin(): boolean {
    const rol = this.authService.getRoleDisplayName().toLowerCase();
    return rol === 'Administrador';
  }

  cerrarSesion() {
    this.authService.logout();
  }
}