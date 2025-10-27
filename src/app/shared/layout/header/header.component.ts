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
    const rol = this.authService.currentUser?.rol;
    if (rol === 'admin') {
      const rol = this.authService.currentUser?.rol ?? 'paciente';
      return MENU_DASHBOARD[rol] || [];
    } else if (rol === 'doctor') {
      const rol = this.authService.currentUser?.rol ?? 'doctor';
      return MENU_DASHBOARD[rol] || [];
    } else { 
      const rol = this.authService.currentUser?.rol ?? 'admin';
      return MENU_DASHBOARD[rol] || [];
    }
  }

  get logueado(): boolean {
    return this.authService.isLoggedIn();
  }

  get nombreUsuario(): string | null {
    return this.authService.currentUser?.nombre || null;
  }

  get userEmail(): string | null {
    return this.authService.currentUser?.email || null;
  }

  get isAdmin(): boolean {
    return this.authService.currentUser?.rol === 'admin';
  }

  cerrarSesion() {
    this.authService.logout();
  }
}