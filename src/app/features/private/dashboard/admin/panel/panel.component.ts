import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../../core/services/auth.service';
import { Usuario } from '../../../../../core/models/users/usuario';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent implements OnInit {
  currentUser: Usuario | null = null;
  
  stats = {
    usuariosRegistrados: 1234,
    mascotasAdopcion: 45,
    pedidosPendientes: 23,
    citasHoy: 12,
    productosStock: 156,
    valorInventario: '3936.30'
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
}
