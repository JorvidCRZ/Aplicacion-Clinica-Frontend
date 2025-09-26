import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Usuario } from '../../../../core/models/users/usuario';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  currentUser: Usuario | null = null;
  sidebarOpen = false;

  sidebarItems = [
    { title: 'Dashboard', route: '/admin/panel', icon: 'bi-speedometer2' },
    { title: 'Usuarios', route: '/admin/usuarios', icon: 'bi-people' },
    { title: 'Mascotas', route: '/admin/mascotas', icon: 'bi-heart' },
    { title: 'Productos', route: '/admin/productos', icon: 'bi-box-seam' },
    { title: 'Pedidos', route: '/admin/pedidos', icon: 'bi-bag' },
    { title: 'Citas', route: '/admin/citas', icon: 'bi-calendar-event' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
