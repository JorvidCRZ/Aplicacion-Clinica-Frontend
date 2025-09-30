import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/users/usuario';
import { Doctor } from '../../../core/models/users/doctor';
import { Admin } from '../../../core/models/users/admin';
import { Paciente } from '../../../core/models/users/paciente';
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
    let usuarios: (Usuario | Doctor | Admin | Paciente)[] = [];
    const usuariosStr = localStorage.getItem('usuarios');
    if (usuariosStr) {
      const usuariosParsed = JSON.parse(usuariosStr);
      // Restaurar tipos específicos basados en el rol
      usuarios = usuariosParsed.map((u: any) => {
        if (u.rol === 'doctor') {
          return u as Doctor;
        } else if (u.rol === 'admin') {
          return u as Admin;
        } else if (u.rol === 'paciente') {
          return u as Paciente;
        } else {
          return u as Usuario;
        }
      });
      console.log('📦 LoginComponent - Usuarios cargados del localStorage:', usuarios);
    }

    // Asegurar que el admin predeterminado exista
    const adminUser: Admin = {
      id: 1,
      nombre: 'Administrador',
      email: 'admin@gmail.com',
      telefono: '999999999',
      password: 'admin123',
      rol: 'admin',
      permisos: ['usuarios', 'doctores', 'pacientes', 'citas', 'reportes', 'configuracion'],
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678'
    };

    const doctorUser: Doctor = {
      id: 2,
      nombre: 'Jesus Andres',
      apellidoPaterno: 'Lujan',
      apellidoMaterno: 'Carrion',
      email: 'doctor@gmail.com',
      telefono: '+51 987 654 321',
      password: 'doctor123',
      rol: 'doctor',
      especialidad: 'Cardiología',
      nroColegiado: 'CMP-12345',
      tipoDocumento: 'DNI',
      numeroDocumento: '87654321',
      fechaNacimiento: new Date('1985-06-15'),
      genero: 'masculino',
      pais: 'Peru',
      departamento: 'Lima',
      provincia: 'Lima',
      distrito: 'Los Olivos',
      domicilio: 'Av. Los Olivos 1234, Los Olivos, Lima, Perú'
    };

    // 🤒 Crear pacientes de ejemplo
    const paciente1: Paciente = {
      id: 3,
      nombre: 'Jorge David',
      apellidoPaterno: 'Cruz',
      apellidoMaterno: 'Peña',
      email: 'jdcruzp11@gmail.com',
      telefono: '+51 987 123 456',
      password: 'Jorvix123*',
      rol: 'paciente',
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      fechaNacimiento: new Date('1990-03-15'),
      genero: 'masculino',
      pais: 'Peru',
      departamento: 'Lima',
      provincia: 'Lima',
      distrito: 'SJL',
      domicilio: 'Av. Pardo 456, SJL, Lima, Perú',
      historialMedico: 'Sin antecedentes relevantes',
      contactoEmergencia: {
        nombre: 'Olinda Huaripata',
        telefono: '+51 987 789 012',
        relacion: 'esposa'
      }
    };

    const paciente2: Paciente = {
      id: 4,
      nombre: 'Olinda Milagros',
      apellidoPaterno: 'Huaripata',
      apellidoMaterno: 'Navarro',
      email: 'Olih@gmail.com',
      telefono: '+51 987 789 012',
      password: 'Linda123*',
      rol: 'paciente',
      tipoDocumento: 'DNI',
      numeroDocumento: '87654321',
      fechaNacimiento: new Date('1985-07-22'),
      genero: 'femenino',
      pais: 'Peru',
      departamento: 'Lima',
      provincia: 'Lima',
      distrito: 'San Isidro',
      domicilio: 'Av. República 789, San Isidro, Lima, Perú',
      historialMedico: 'Hipertensión controlada',
      alergias: ['Penicilina'],
      contactoEmergencia: {
        nombre: 'Jorge  Cruz',
        telefono: '+51 987 123 456',
        relacion: 'esposo'  
      }
    };

    console.log('🤒 LoginComponent - Pacientes creados:', { paciente1, paciente2 });

    if (!usuarios.some(u => u.email === adminUser.email)) {
      console.log('👑 LoginComponent - Agregando adminUser por primera vez');
      usuarios.push(adminUser);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    if (!usuarios.some(u => u.email === doctorUser.email)) {
      console.log('👨‍⚕️ LoginComponent - Agregando doctorUser por primera vez:', doctorUser);
      console.log('🔑 LoginComponent - Propiedades del doctorUser:', Object.keys(doctorUser));
      usuarios.push(doctorUser);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    } else {
      console.log('✅ LoginComponent - Doctor ya existe en localStorage');
    }

    // Agregar pacientes si no existen
    if (!usuarios.some(u => u.email === paciente1.email)) {
      console.log('🤒 LoginComponent - Agregando paciente1 por primera vez');
      usuarios.push(paciente1);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    if (!usuarios.some(u => u.email === paciente2.email)) {
      console.log('🤒 LoginComponent - Agregando paciente2 por primera vez');
      usuarios.push(paciente2);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    // Buscar usuario válido
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    const user = usuarios.find(u => u.email === email && u.password === password);

    console.log('🔍 LoginComponent - Usuario encontrado:', user);
    console.log('🔍 LoginComponent - Propiedades del usuario encontrado:', user ? Object.keys(user) : 'No encontrado');

    if (user) {
      console.log('🚀 LoginComponent - Enviando usuario al AuthService:', user);
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
            this.router.navigate(['/paciente/resumen']);
            break;
        }
      }
    } else {
      this.error = 'Correo o contraseña incorrectos';
    }
  }
}
