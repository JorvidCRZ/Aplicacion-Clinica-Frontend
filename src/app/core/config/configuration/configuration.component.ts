import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { UsuarioService } from '../../services/rol/usuario.service';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent {

  seccionActiva = 'seguridad';
  notificacionEmail = true;

  // Modal de contraseña
  mostrarModalContrasena = false;
  mostrarPasswordActual = false;
  mostrarPasswordNueva = false;
  mostrarPasswordConfirmar = false;
  cargandoCambio = false;
  passwordStrength = 'weak';
  passwordStrengthText = 'Débil';

  // Historial de sesiones
  mostrarModalHistorial = false;
  historialActivado = true;

  // Autenticación de dos factores
  mostrarModalAuth2FA = false;
  auth2FAActivado = false;
  pasoActual2FA = 1; // 1: intro, 2: configurar app, 3: verificar código, 4: completado
  cargandoActivacion2FA = false;
  codigoQR = 'JBSWY3DPEHPK3PXP'; // Código secreto simulado
  urlQR = 'otpauth://totp/Clinica:usuario@clinica.com?secret=JBSWY3DPEHPK3PXP&issuer=Clinica';
  codigoVerificacion = '';
  codigosRecuperacion = [
    'A1B2C3D4',
    'E5F6G7H8', 
    'I9J0K1L2',
    'M3N4O5P6',
    'Q7R8S9T0',
    'U1V2W3X4',
    'Y5Z6A7B8',
    'C9D0E1F2'
  ];

  sesionesRecientes = [
    {
      fecha: new Date(2025, 11, 1, 14, 30),
      dispositivo: 'Windows PC - Chrome',
      ubicacion: 'Lima, Perú',
      ip: '192.168.1.100',
      estado: 'Activa'
    },
    {
      fecha: new Date(2025, 10, 30, 9, 15),
      dispositivo: 'Android - Chrome Mobile',
      ubicacion: 'Lima, Perú',
      ip: '192.168.1.105',
      estado: 'Finalizada'
    },
    {
      fecha: new Date(2025, 10, 29, 16, 45),
      dispositivo: 'Windows PC - Edge',
      ubicacion: 'Lima, Perú',
      ip: '192.168.1.100',
      estado: 'Finalizada'
    },
    {
      fecha: new Date(2025, 10, 28, 11, 20),
      dispositivo: 'iPhone - Safari',
      ubicacion: 'Lima, Perú',
      ip: '192.168.1.110',
      estado: 'Finalizada'
    }
  ];

  cambiarPasswordForm!: FormGroup;
  usuarioId: number;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {
    this.usuarioId = this.authService.currentUser?.idUsuario || 0;
    this.inicializarForm();
  }

  private inicializarForm(): void {
    this.cambiarPasswordForm = this.fb.group({
      actual: ['', [Validators.required, Validators.minLength(6)]],
      nueva: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.cambiarPasswordForm.get('nueva')?.valueChanges.subscribe(value => {
      this.calcularSeguridadPassword(value);
    });
  }

  private passwordMatchValidator(form: any) {
    const nueva = form.get('nueva');
    const confirmar = form.get('confirmar');
    
    if (nueva && confirmar && nueva.value !== confirmar.value) {
      confirmar.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  private calcularSeguridadPassword(password: string): void {
    if (!password) {
      this.passwordStrength = 'weak';
      this.passwordStrengthText = 'Débil';
      return;
    }

    let score = 0;
    
    if (password.length >= 8) score += 2;
    else if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1; 
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    if (score < 3) {
      this.passwordStrength = 'weak';
      this.passwordStrengthText = 'Débil';
    } else if (score < 5) {
      this.passwordStrength = 'medium';
      this.passwordStrengthText = 'Media';
    } else {
      this.passwordStrength = 'strong';
      this.passwordStrengthText = 'Fuerte';
    }
  }

  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
  }

  // Métodos del modal
  abrirModalContrasena(): void {
    this.mostrarModalContrasena = true;
    this.cambiarPasswordForm.reset();
    this.passwordStrength = 'weak';
    this.passwordStrengthText = 'Débil';
  }

  cerrarModalContrasena(): void {
    this.mostrarModalContrasena = false;
    this.mostrarPasswordActual = false;
    this.mostrarPasswordNueva = false;
    this.mostrarPasswordConfirmar = false;
    this.cambiarPasswordForm.reset();
  }

  cerrarModal(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cerrarModalContrasena();
    }
  }

  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'actual':
        this.mostrarPasswordActual = !this.mostrarPasswordActual;
        break;
      case 'nueva':
        this.mostrarPasswordNueva = !this.mostrarPasswordNueva;
        break;
      case 'confirmar':
        this.mostrarPasswordConfirmar = !this.mostrarPasswordConfirmar;
        break;
    }
  }

  onCambiarContrasena(): void {
    if (this.cambiarPasswordForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.cambiarPasswordForm.controls).forEach(key => {
        this.cambiarPasswordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.cargandoCambio = true;
    const data = {
      actual: this.cambiarPasswordForm.value.actual,
      nueva: this.cambiarPasswordForm.value.nueva
    };

    this.usuarioService.cambiarContrasena(this.usuarioId, data).subscribe({
      next: () => {
        this.cargandoCambio = false;
        this.mostrarNotificacion('✅ Contraseña actualizada correctamente', 'success');
        this.cerrarModalContrasena();
      },
      error: (err) => {
        this.cargandoCambio = false;
        this.mostrarNotificacion(`❌ Error: ${err.error.mensaje || 'No se pudo cambiar la contraseña'}`, 'error');
      }
    });
  }

  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error'): void {
    // Aquí puedes implementar un sistema de notificaciones más elegante
    alert(mensaje);
  }

  // Métodos del historial de sesiones
  verHistorialSesiones(): void {
    this.mostrarModalHistorial = true;
  }

  cerrarModalHistorial(): void {
    this.mostrarModalHistorial = false;
  }

  toggleHistorialActivado(): void {
    this.historialActivado = !this.historialActivado;
    const estado = this.historialActivado ? 'activado' : 'desactivado';
    this.mostrarNotificacion(`📋 Registro de historial de sesiones ${estado}`, 'success');
  }

  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerIconoDispositivo(dispositivo: string): string {
    if (dispositivo.includes('Windows')) return 'fa-desktop';
    if (dispositivo.includes('Android')) return 'fa-mobile-alt';
    if (dispositivo.includes('iPhone')) return 'fa-mobile-alt';
    if (dispositivo.includes('iPad')) return 'fa-tablet-alt';
    return 'fa-laptop';
  }

  trackBySesion(index: number, sesion: any): string {
    return `${sesion.fecha.getTime()}-${sesion.dispositivo}`;
  }

  trackByCodigo(index: number, codigo: string): string {
    return codigo;
  }

  // Métodos de autenticación de dos factores
  configurarAutenticacion(): void {
    this.mostrarModalAuth2FA = true;
    this.pasoActual2FA = 1;
    this.codigoVerificacion = '';
  }

  cerrarModalAuth2FA(): void {
    this.mostrarModalAuth2FA = false;
    this.pasoActual2FA = 1;
    this.codigoVerificacion = '';
    this.cargandoActivacion2FA = false;
  }

  avanzarPaso2FA(): void {
    if (this.pasoActual2FA < 4) {
      this.pasoActual2FA++;
    }
  }

  retrocederPaso2FA(): void {
    if (this.pasoActual2FA > 1) {
      this.pasoActual2FA--;
    }
  }

  verificarCodigo2FA(): void {
    if (this.codigoVerificacion.length !== 6) {
      this.mostrarNotificacion('❌ El código debe tener 6 dígitos', 'error');
      return;
    }

    this.cargandoActivacion2FA = true;
    
    // Simular verificación
    setTimeout(() => {
      this.cargandoActivacion2FA = false;
      this.auth2FAActivado = true;
      this.pasoActual2FA = 4;
      this.mostrarNotificacion('✅ Autenticación de dos factores activada correctamente', 'success');
    }, 2000);
  }

  desactivar2FA(): void {
    this.auth2FAActivado = false;
    this.cerrarModalAuth2FA();
    this.mostrarNotificacion('🔓 Autenticación de dos factores desactivada', 'success');
  }

  copiarCodigo(codigo: string): void {
    navigator.clipboard.writeText(codigo).then(() => {
      this.mostrarNotificacion('📋 Código copiado al portapapeles', 'success');
    });
  }

  copiarCodigoSecreto(): void {
    navigator.clipboard.writeText(this.codigoQR).then(() => {
      this.mostrarNotificacion('📋 Código secreto copiado', 'success');
    });
  }

  descargarCodigosRecuperacion(): void {
    const texto = 'Códigos de Recuperación - Autenticación de Dos Factores\n\n';
    const codigos = this.codigosRecuperacion.map(c => `- ${c}`).join('\n');
    const contenido = texto + codigos + '\n\nGuarda estos códigos en un lugar seguro.';
    
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codigos-recuperacion-2fa.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    
    this.mostrarNotificacion('💾 Códigos de recuperación descargados', 'success');
  }

}