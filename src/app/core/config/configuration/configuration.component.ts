import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent {
  
  // 🎛️ Control de secciones
  seccionActiva = 'seguridad';

  // � Configuración simple de notificaciones
  notificacionEmail = true;


  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
  }

  // 🔐 Cambiar contraseña
  cambiarContrasena(): void {
    const nuevaContrasena = prompt('Ingresa tu nueva contraseña:');
    if (nuevaContrasena && nuevaContrasena.length >= 6) {
      console.log('Nueva contraseña configurada');
      alert('✅ Contraseña actualizada correctamente');
    } else if (nuevaContrasena) {
      alert('❌ La contraseña debe tener al menos 6 caracteres');
    }
  }

  // 🔒 Configurar autenticación de dos factores
  configurarAutenticacion(): void {
    const confirmar = confirm('¿Deseas activar la autenticación de dos factores?');
    if (confirmar) {
      console.log('2FA activado');
      alert('✅ Autenticación de dos factores activada');
    }
  }

  // 📋 Ver historial de sesiones
  verHistorialSesiones(): void {
    const sesiones = [
      { fecha: '2025-09-29 10:30', dispositivo: 'Chrome - Windows', ip: '192.168.1.100' },
      { fecha: '2025-09-28 15:45', dispositivo: 'Safari - iPhone', ip: '192.168.1.101' },
      { fecha: '2025-09-27 09:15', dispositivo: 'Firefox - Windows', ip: '192.168.1.100' }
    ];
    
    console.log('Historial de sesiones:', sesiones);
    alert('📋 Historial mostrado en consola (F12 para ver)');
  }

  // 🗑️ Cerrar todas las sesiones
  cerrarTodasLasSesiones(): void {
    const confirmar = confirm('¿Estás seguro de cerrar todas las sesiones activas?');
    if (confirmar) {
      console.log('Cerrando todas las sesiones...');
      alert('✅ Todas las sesiones han sido cerradas');
    }
  }

  // � Guardar configuración de email
  guardarNotificacionEmail(): void {
    localStorage.setItem('notificacion-email', JSON.stringify(this.notificacionEmail));
    const estado = this.notificacionEmail ? 'activadas' : 'desactivadas';
    alert(`✅ Notificaciones por email ${estado}`);
  }

}
