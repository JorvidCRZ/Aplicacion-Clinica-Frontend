import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from '../../../core/models/common/menu-items';
import { LogoComponent } from './logo/logo.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AccountMenuComponent } from './account-menu/account-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent, NavbarComponent, AccountMenuComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menuItems: MenuItem[] = [
    { label: 'Inicio', route: '/inicio', exact: true },
    { label: 'Especialidades', route: '/especialidades' },
    { label: 'Nosotros', route: '/nosotros' },
    { label: 'Citas', route: '/citas' },
    { label: 'Blog/Noticias', route: '/blog' },
    { label: 'Contacto', route: '/contacto' }
  ];

  constructor(public authService: AuthService) { }

  get accountLinks() {
    if (!this.authService.isLoggedIn()) return [];
    const rol = this.authService.currentUser?.rol;
    if (rol === 'admin') {
      return [
        { label: 'Resumen', route: '/admin/resumen', icon: 'fa fa-tachometer-alt' },
        { label: 'Gestión Citas', route: '/admin/gestion-citas', icon: 'fa fa-calendar' },
        { label: 'Gestión Doctores', route: '/admin/gestion-doctores', icon: 'fa fa-user-md' },
        { label: 'Gestión Pacientes', route: '/admin/gestion-pacientes', icon: 'fa fa-users' },
        { label: 'Gestión Usuarios', route: '/admin/gestion-usuarios', icon: 'fa fa-user-cog' },
        { label: 'Reportes', route: '/admin/reportes', icon: 'fa fa-chart-line' }
      ];
    } else if (rol === 'doctor') {
      return [
        { label: 'Resumen', route: '/doctor/resumen', icon: 'fa fa-tachometer-alt' },
        { label: 'Mi Perfil', route: '/doctor/perfil', icon: 'fa fa-user' },
        { label: 'Citas', route: '/doctor/citas', icon: 'fa fa-calendar' },
        { label: 'Reporte Personal', route: '/doctor/reporte-personal', icon: 'fa fa-file-alt' },
        { label: 'Horarios', route: '/doctor/horarios', icon: 'fa fa-clock' },
        { label: 'Pacientes', route: '/doctor/pacientes', icon: 'fa fa-users' }
      ];
    } else { // paciente
      return [
        { label: 'Resumen', route: '/paciente', icon: 'fa fa-tachometer-alt' },
        { label: 'Mi Perfil', route: '/paciente/mi-perfil', icon: 'fa fa-user' },
        { label: 'Mis Citas', route: '/paciente/mis-citas', icon: 'fa fa-calendar' },
        { label: 'Historial Médico', route: '/paciente/historial-medico', icon: 'fa fa-notes-medical' },
        { label: 'Pagos', route: '/paciente/pagos', icon: 'fa fa-credit-card' }
      ];
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