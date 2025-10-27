import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, AuthState } from '../../../../../core/services/rol/auth.service';
import { Paciente } from '../../../../../core/models/users/paciente';

interface ContactoEmergencia {
  nombre: string;
  relacion: string;
  telefono: string;
  telefonoAlt: string;
}

interface PerfilPaciente {
  // Información Personal
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento: string;
  genero: string;
  estadoCivil: string;
  
  // Información de Contacto
  email: string;
  telefono: string;
  telefonoEmergencia: string;
  direccion: string;
  
  // Información Médica
  tipoSangre: string;
  peso: number;
  altura: number;
  alergias: string;
  medicamentosActuales: string;
  antecedentesMedicos: string;
  
  // Contacto de Emergencia
  contactoEmergencia: ContactoEmergencia;
}

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent implements OnInit, OnDestroy {

  // Estados de edición
  editandoPersonal: boolean = false;
  editandoContacto: boolean = false;
  editandoMedica: boolean = false;
  editandoEmergencia: boolean = false;

  // Mensaje de confirmación
  mensajeGuardado: string = '';

  // Usuario actual
  usuarioActual: Paciente | null = null;
  authSubscription: Subscription | null = null;

  // Datos del perfil
  perfilPaciente: PerfilPaciente = {
    // Información Personal
    nombres: '',
    apellidos: '',
    dni: '',
    fechaNacimiento: '',
    genero: 'masculino',
    estadoCivil: 'soltero',
    
    // Información de Contacto
    email: '',
    telefono: '',
    telefonoEmergencia: '',
    direccion: '',
    
    // Información Médica
    tipoSangre: 'O+',
    peso: 0,
    altura: 0,
    alergias: '',
    medicamentosActuales: '',
    antecedentesMedicos: '',
    
    // Contacto de Emergencia
    contactoEmergencia: {
      nombre: '',
      relacion: 'Padre/Madre',
      telefono: '',
      telefonoAlt: ''
    }
  };

  // Copias de respaldo para cancelar cambios
  private respaldoPersonal: any = {};
  private respaldoContacto: any = {};
  private respaldoMedica: any = {};
  private respaldoEmergencia: any = {};

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authSubscription = this.authService.authState$.subscribe((authState: AuthState) => {
      if (authState.user && authState.user.rol === 'paciente') {
        this.usuarioActual = authState.user as Paciente;
        this.cargarPerfilPaciente();
      }
    });
  }

  ngOnDestroy(): void {
    // Cancelar suscripción para evitar memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private cargarPerfilPaciente(): void {
    if (this.usuarioActual) {
      // Mapear datos del usuario logueado al perfil
      this.perfilPaciente = {
        // Información Personal
        nombres: this.usuarioActual.nombre || '',
        apellidos: `${this.usuarioActual.apellidoPaterno || ''} ${this.usuarioActual.apellidoMaterno || ''}`.trim(),
        dni: this.usuarioActual.numeroDocumento || '',
        fechaNacimiento: this.formatearFecha(this.usuarioActual.fechaNacimiento),
        genero: this.usuarioActual.genero || 'masculino',
        estadoCivil: 'soltero', // No disponible en el modelo actual
        
        // Información de Contacto
        email: this.usuarioActual.email || '',
        telefono: this.usuarioActual.telefono || '',
        telefonoEmergencia: '', // No disponible en el modelo actual
        direccion: this.usuarioActual.domicilio || '',
        
        // Información Médica
        tipoSangre: 'O+', // No disponible en el modelo actual
        peso: 0, // No disponible en el modelo actual
        altura: 0, // No disponible en el modelo actual
        alergias: Array.isArray(this.usuarioActual.alergias) ? this.usuarioActual.alergias.join(', ') : (this.usuarioActual.alergias || ''),
        medicamentosActuales: '', // No disponible en el modelo actual
        antecedentesMedicos: this.usuarioActual.historialMedico || '',
        
        // Contacto de Emergencia
        contactoEmergencia: {
          nombre: this.usuarioActual.contactoEmergencia?.nombre || '',
          relacion: this.usuarioActual.contactoEmergencia?.relacion || 'Padre/Madre',
          telefono: this.usuarioActual.contactoEmergencia?.telefono || '',
          telefonoAlt: '' // No disponible en el modelo actual
        }
      };
      
      console.log('Perfil del paciente cargado desde usuario actual:', this.usuarioActual.nombre);
    }
  }

  private formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return '';
    
    try {
      // Si es string, intentar convertir a Date
      if (typeof fecha === 'string') {
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) return '';
        return fechaObj.toISOString().split('T')[0];
      }
      
      // Si es Date, usar directamente
      if (fecha instanceof Date) {
        if (isNaN(fecha.getTime())) return '';
        return fecha.toISOString().split('T')[0];
      }
      
      return '';
    } catch (error) {
      console.warn('Error al formatear fecha:', error);
      return '';
    }
  }

  // Métodos de edición - Información Personal
  editarInformacionPersonal(): void {
    this.editandoPersonal = true;
    this.respaldoPersonal = {
      nombres: this.perfilPaciente.nombres,
      apellidos: this.perfilPaciente.apellidos,
      dni: this.perfilPaciente.dni,
      fechaNacimiento: this.perfilPaciente.fechaNacimiento,
      genero: this.perfilPaciente.genero,
      estadoCivil: this.perfilPaciente.estadoCivil
    };
  }

  guardarInformacionPersonal(): void {
    // Validaciones básicas
    if (!this.perfilPaciente.nombres || !this.perfilPaciente.apellidos) {
      alert('Los nombres y apellidos son obligatorios');
      return;
    }

    this.editandoPersonal = false;
    this.mostrarMensajeGuardado('Información personal actualizada correctamente');
    
    // Aquí enviarías los datos al backend
    console.log('Guardando información personal:', this.respaldoPersonal);
  }

  cancelarEdicionPersonal(): void {
    this.perfilPaciente.nombres = this.respaldoPersonal.nombres;
    this.perfilPaciente.apellidos = this.respaldoPersonal.apellidos;
    this.perfilPaciente.dni = this.respaldoPersonal.dni;
    this.perfilPaciente.fechaNacimiento = this.respaldoPersonal.fechaNacimiento;
    this.perfilPaciente.genero = this.respaldoPersonal.genero;
    this.perfilPaciente.estadoCivil = this.respaldoPersonal.estadoCivil;
    this.editandoPersonal = false;
  }

  // Métodos de edición - Contacto
  editarContacto(): void {
    this.editandoContacto = true;
    this.respaldoContacto = {
      email: this.perfilPaciente.email,
      telefono: this.perfilPaciente.telefono,
      telefonoEmergencia: this.perfilPaciente.telefonoEmergencia,
      direccion: this.perfilPaciente.direccion
    };
  }

  guardarContacto(): void {
    if (!this.perfilPaciente.email || !this.perfilPaciente.telefono) {
      alert('El email y teléfono son obligatorios');
      return;
    }

    this.editandoContacto = false;
    this.mostrarMensajeGuardado('Información de contacto actualizada correctamente');
  }

  cancelarEdicionContacto(): void {
    this.perfilPaciente.email = this.respaldoContacto.email;
    this.perfilPaciente.telefono = this.respaldoContacto.telefono;
    this.perfilPaciente.telefonoEmergencia = this.respaldoContacto.telefonoEmergencia;
    this.perfilPaciente.direccion = this.respaldoContacto.direccion;
    this.editandoContacto = false;
  }

  // Métodos de edición - Información Médica
  editarInformacionMedica(): void {
    this.editandoMedica = true;
    this.respaldoMedica = {
      tipoSangre: this.perfilPaciente.tipoSangre,
      peso: this.perfilPaciente.peso,
      altura: this.perfilPaciente.altura,
      alergias: this.perfilPaciente.alergias,
      medicamentosActuales: this.perfilPaciente.medicamentosActuales,
      antecedentesMedicos: this.perfilPaciente.antecedentesMedicos
    };
  }

  guardarInformacionMedica(): void {
    this.editandoMedica = false;
    this.mostrarMensajeGuardado('Información médica actualizada correctamente');
  }

  cancelarEdicionMedica(): void {
    this.perfilPaciente.tipoSangre = this.respaldoMedica.tipoSangre;
    this.perfilPaciente.peso = this.respaldoMedica.peso;
    this.perfilPaciente.altura = this.respaldoMedica.altura;
    this.perfilPaciente.alergias = this.respaldoMedica.alergias;
    this.perfilPaciente.medicamentosActuales = this.respaldoMedica.medicamentosActuales;
    this.perfilPaciente.antecedentesMedicos = this.respaldoMedica.antecedentesMedicos;
    this.editandoMedica = false;
  }

  // Métodos de edición - Contacto de Emergencia
  editarEmergencia(): void {
    this.editandoEmergencia = true;
    this.respaldoEmergencia = { ...this.perfilPaciente.contactoEmergencia };
  }

  guardarEmergencia(): void {
    if (!this.perfilPaciente.contactoEmergencia.nombre || !this.perfilPaciente.contactoEmergencia.telefono) {
      alert('El nombre y teléfono del contacto de emergencia son obligatorios');
      return;
    }

    this.editandoEmergencia = false;
    this.mostrarMensajeGuardado('Contacto de emergencia actualizado correctamente');
  }

  cancelarEdicionEmergencia(): void {
    this.perfilPaciente.contactoEmergencia = { ...this.respaldoEmergencia };
    this.editandoEmergencia = false;
  }

  // Utilidades
  calcularIMC(): string {
    if (this.perfilPaciente.peso && this.perfilPaciente.altura) {
      const alturaMetros = this.perfilPaciente.altura / 100;
      const imc = this.perfilPaciente.peso / (alturaMetros * alturaMetros);
      
      let categoria = '';
      if (imc < 18.5) categoria = 'Bajo peso';
      else if (imc < 25) categoria = 'Normal';
      else if (imc < 30) categoria = 'Sobrepeso';
      else categoria = 'Obesidad';
      
      return `${imc.toFixed(1)} (${categoria})`;
    }
    return 'No calculado';
  }

  private mostrarMensajeGuardado(mensaje: string): void {
    this.mensajeGuardado = mensaje;
    setTimeout(() => {
      this.mensajeGuardado = '';
    }, 3000);
  }
}
