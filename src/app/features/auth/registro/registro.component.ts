import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Usuario } from '../../../core/models/users/usuario';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
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

  isEmailValid: boolean = false;
  emailTouched: boolean = false;
  isPasswordValid: boolean = false;
  passwordTouched: boolean = false;
  isConfirmPasswordValid: boolean = false;
  confirmPasswordTouched: boolean = false;

  constructor(private router: Router, private authService: AuthService) { }

  onSubmit(event: Event) {
    event.preventDefault();

    // Validaciones básicas
    if (!this.nombre.trim() || !this.email.trim() || !this.telefono.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      this.error = 'Por favor, completa todos los campos.';
      this.success = false;
      return;
    }
    if (!this.isValidEmail(this.email)) {
      this.error = 'Por favor, ingresa un correo electrónico válido.';
      this.success = false;
      return;
    }
    if (!this.isPhoneValid(this.telefono)) {
      this.error = 'El número de celular no es válido (9 dígitos).';
      this.success = false;
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
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

    // Recuperar usuarios guardados
    let usuarios: Usuario[] = JSON.parse(localStorage.getItem('usuarios') || '[]');

    // Verificar si ya existe el correo
    if (usuarios.some(u => u.email === this.email)) {
      this.error = 'Este correo ya está registrado.';
      this.success = false;
      return;
    }

    // Crear nuevo usuario con rol paciente por defecto
    const nuevoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
    const nuevoUsuario: Usuario = {
      id: nuevoId,
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono,
      password: this.password,
      rol: 'paciente'
    };

    // Guardar usuario en localStorage
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Opcional: hacer login automático
    // this.authService.login(nuevoUsuario);

    this.success = true;

    // Redirigir al login
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1200);
  }

  // --- Validaciones ---
  isValidEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  validateEmail() {
    this.emailTouched = true;
    this.isEmailValid = this.isValidEmail(this.email);
  }

  validatePassword() {
    this.passwordTouched = true;
    this.isPasswordValid = this.password.length >= 6;
    this.checkPasswordStrength(this.password);
  }

  validateConfirmPassword() {
    this.confirmPasswordTouched = true;
    this.isConfirmPasswordValid = this.password === this.confirmPassword && this.confirmPassword.length > 0;
  }

  checkPasswordStrength(password: string) {
    if (!password) {
      this.passwordStrengthMsg = '';
      this.passwordStrengthClass = '';
      return;
    }
    if (password.length < 6) {
      this.passwordStrengthMsg = 'Muy débil';
      this.passwordStrengthClass = 'text-danger';
    } else if (/[A-Z]/.test(password) && /\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
      this.passwordStrengthMsg = 'Fuerte';
      this.passwordStrengthClass = 'text-success';
    } else {
      this.passwordStrengthMsg = 'Aceptable';
      this.passwordStrengthClass = 'text-warning';
    }
  }

  isPhoneValid(phone: string): boolean {
    return /^[0-9]{9}$/.test(phone);
  }
}
