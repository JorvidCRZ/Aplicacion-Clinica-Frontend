import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { Usuario } from '../../../../../core/models/users/usuario';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit {
  currentUser: Usuario | null = null;
  sidebarOpen = false;

  sidebarItems = [
    { title: 'Resumen', route: '/usuario/resumen', icon: 'bi-house' },
    { title: 'Mi Perfil', route: '/usuario/perfil', icon: 'bi-person' },
    { title: 'Mis Mascotas', route: '/usuario/mascotas', icon: 'bi-heart' },
    { title: 'Mis Citas', route: '/usuario/citas', icon: 'bi-calendar-event' },
    { title: 'Mis Adopciones', route: '/usuario/adopciones', icon: 'bi-heart-fill' },
    { title: 'Mis Pedidos', route: '/usuario/pedidos', icon: 'bi-bag' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}
