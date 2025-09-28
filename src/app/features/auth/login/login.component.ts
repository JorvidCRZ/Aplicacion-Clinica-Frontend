import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/users/usuario';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';

  constructor(private router: Router, private authService: AuthService) { }

  onSubmit(event: Event) {
    event.preventDefault();

    // Cargar usuarios desde localStorage
    let usuarios: Usuario[] = [];
    const usuariosStr = localStorage.getItem('usuarios');
    if (usuariosStr) {
      usuarios = JSON.parse(usuariosStr);
    }

    // Asegurar que el admin predeterminado exista
    const adminUser: Usuario = {
      id: 1,
      nombre: 'Administrador',
      email: 'admin@gmail.com',
      telefono: '999999999',
      password: 'admin123',
      rol: 'admin'
    };

    const doctorUser: Usuario = {
      id: 2,
      nombre: 'lujan Carrion',
      email: 'doctor@gmail.com',
      telefono: '999999999',
      password: 'doctor123',
      rol: 'doctor'
    };

    if (!usuarios.some(u => u.email === adminUser.email)) {
      usuarios.push(adminUser);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    if (!usuarios.some(u => u.email === doctorUser.email)) {
      usuarios.push(doctorUser);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    // Buscar usuario válido
    const user = usuarios.find(u => u.email === this.email && u.password === this.password);

    if (user) {
      // Login mediante AuthService
      this.authService.login(user);

      // Redirigir según rol o redirect guardado
      const redirectTo = this.authService.getRedirectAfterLogin();
      if (redirectTo) {
        this.authService.clearRedirectAfterLogin();
        this.router.navigate([redirectTo]);
      } else {
        switch (user.rol) {
          case 'admin':
            this.router.navigate(['/admin/panel']);
            break;
          case 'doctor':
            this.router.navigate(['/doctor/resumen']);
            break;
          case 'paciente':
            this.router.navigate(['/paciente/mis-citas']);
            break;
        }
      }
    } else {
      this.error = 'Correo o contraseña incorrectos';
    }
  }
}
