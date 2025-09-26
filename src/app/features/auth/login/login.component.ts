import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Usuario } from '../../../core/models/users/usuario';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';

  constructor(private router: Router, private authService: AuthService) { }

  onSubmit(event: Event) {
    // Asegurarse que el admin esté en el array de usuarios
    let usuarios: Usuario[] = [];
    const usuariosStr = localStorage.getItem('usuarios');
    if (usuariosStr) {
      usuarios = JSON.parse(usuariosStr);
    }
    // Buscar admin predeterminado en storage y agregar si no está
    const adminEmail = 'admin@admin.com';
    const adminUser: Usuario = {
      id: 1,
      nombre: 'Administrador',
      email: adminEmail,
      telefono: '999999999',
      password: 'admin123',
      rol: 'admin'
    };
    if (!usuarios.some(u => u.email === adminEmail)) {
      usuarios.push(adminUser);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    // Buscar usuario
    const user = usuarios.find(u => u.email === this.email && u.password === this.password);
    if (user) {
      this.authService.setLoggedIn(user);
      const redirectTo = this.authService.getRedirectAfterLogin();
      if (redirectTo) {
        this.authService.clearRedirectAfterLogin();
        this.router.navigate([redirectTo]);
      } else {
        // Redirigir según rol
        if (user.rol === 'admin') {
          this.router.navigate(['/admin/panel']);
        } else {
          this.router.navigate(['/usuario/resumen']);
        }
      }
    } else {
      this.error = 'Correo o contraseña incorrectos';
    }
  }
}