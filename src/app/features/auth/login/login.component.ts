import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/users/usuario';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-login',
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  hide = true;
  loginForm: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();

    // Validar formulario
    if (this.loginForm.invalid) {
      this.error = 'Por favor completa todos los campos correctamente';
      return;
    }

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
      rol: 'admin',
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678'
    };

    const doctorUser: Usuario = {
      id: 2,
      nombre: 'lujan Carrion',
      email: 'doctor@gmail.com',
      telefono: '999999999',
      password: 'doctor123',
      rol: 'doctor',
      tipoDocumento: 'DNI',
      numeroDocumento: '87654321'
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
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    const user = usuarios.find(u => u.email === email && u.password === password);

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
