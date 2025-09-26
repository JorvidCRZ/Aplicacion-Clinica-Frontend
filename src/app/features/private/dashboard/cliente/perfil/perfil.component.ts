import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../../../core/models/users/usuario';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit{
  currentUser: Usuario | null = null;
  formData: Partial<Usuario> = {};
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.formData = { ...user };
      }
    });
  }

  onSubmit(): void {
    if (this.formData.nombre && this.formData.email && this.formData.telefono) {
      this.loading = true;
      this.errorMessage = '';
      
      // Simular guardado
      setTimeout(() => {
        this.authService.updateUser(this.formData);
        this.loading = false;
        this.successMessage = 'Perfil actualizado correctamente';
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }, 1000);
    } else {
      this.errorMessage = 'Por favor, completa todos los campos obligatorios';
    }
  }
}
