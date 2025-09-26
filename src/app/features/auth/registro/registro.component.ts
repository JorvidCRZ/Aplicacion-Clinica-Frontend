import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Usuario } from '../../../core/models/users/usuario';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  nombre: string = '';
  email: string = '';
  telefono: string = '';
  password: string = '';
  confirmPassword: string = '';
  acceptedTerms: boolean = false;

  error: string = '';
  success: boolean = false;

  showPassword = false;
  showConfirm = false;

  passwordStrengthMsg = '';
  passwordStrengthClass = '';

  // Propiedades para validación de email
  isEmailValid: boolean = false;
  emailTouched: boolean = false;

  // Propiedades para validación de contraseña
  isPasswordValid: boolean = false;
  passwordTouched: boolean = false;
  isConfirmPasswordValid: boolean = false;
  confirmPasswordTouched: boolean = false;

  constructor(private router: Router) { }

  onSubmit(event: Event) {
    event.preventDefault();

    // --- Validaciones ---
    if (!this.nombre.trim() || !this.email.trim() || !this.telefono.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      this.error = 'Por favor, completa todos los campos.';
      this.success = false;
      return;
    }

    // Validar formato del email
    if (!this.isValidEmail(this.email)) {
      this.error = 'Por favor, ingresa un correo electrónico válido.';
      this.success = false;
      return;
    }

    // Validar longitud de contraseña
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      this.success = false;
      return;
    }

    if (!this.isPhoneValid(this.telefono)) {
      this.error = 'El número de celular no es válido (debe tener 9 dígitos).';
      this.success = false;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      this.success = false;
      return;
    }

    if (!this.acceptedTerms) {
      this.error = 'Debes aceptar los términos y condiciones.';
      this.success = false;
      return;
    }

    this.error = '';

    // --- Recuperar usuarios guardados ---
    let usuarios: Usuario[] = JSON.parse(localStorage.getItem('usuarios') || '[]');

    // Verificar si ya existe el correo
    if (usuarios.some(u => u.email === this.email)) {
      this.error = 'Este correo ya está registrado.';
      this.success = false;
      return;
    }

    const numeroid = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
    // Crear nuevo usuario
    const user: Usuario = {
      id: numeroid,
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono,
      password: this.password,
      rol: 'usuario' as 'paciente' | 'admin' | 'doctor'
    };

    // Guardar en la lista
    usuarios.push(user);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.removeItem('logueado'); // evitar que quede logueado directo

    this.success = true;

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1200);
  }

  // --- Validación de email ---
  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // --- Validación en tiempo real del email ---
  validateEmail() {
    this.emailTouched = true;
    this.isEmailValid = this.isValidEmail(this.email);
  }

  // --- Validación en tiempo real de la contraseña ---
  validatePassword() {
    this.passwordTouched = true;
    this.isPasswordValid = this.password.length >= 6;
    this.checkPasswordStrength(this.password);
  }

  // --- Validación en tiempo real de la confirmación de contraseña ---
  validateConfirmPassword() {
    this.confirmPasswordTouched = true;
    this.isConfirmPasswordValid = this.password === this.confirmPassword && this.confirmPassword.length > 0;
  }

  // --- chequeo fuerza de contraseña ---
  checkPasswordStrength(password: string) {
    if (!password) {
      this.passwordStrengthMsg = '';
      this.passwordStrengthClass = '';
      return;
    }

    if (password.length < 6) {
      this.passwordStrengthMsg = 'Muy débil';
      this.passwordStrengthClass = 'text-danger';
    } else if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.match(/[^a-zA-Z0-9]/)) {
      this.passwordStrengthMsg = 'Fuerte';
      this.passwordStrengthClass = 'text-success';
    } else {
      this.passwordStrengthMsg = 'Aceptable';
      this.passwordStrengthClass = 'text-warning';
    }
  }

  // --- validador de teléfono (9 dígitos exactos para Perú) ---
  isPhoneValid(phone: string): boolean {
    const regex = /^[0-9]{9}$/;
    return regex.test(phone);
  }
}
