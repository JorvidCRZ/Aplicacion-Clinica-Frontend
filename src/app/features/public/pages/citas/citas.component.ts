import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuscadorComponent } from '../../../../shared/components/buscador/buscador.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/rol/auth.service';


@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, BuscadorComponent],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})

export class CitasComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Estado del modal de reserva
  mostrarModal = false;
  citaParaReservar: any = null;
  horarioParaReservar: string = '';

  // Datos del formulario de cita
  datosCita = {
    motivo: '',
    tipoConsulta: 'consulta-general',
    observaciones: ''
  };

  ngOnInit(): void {
    // Inicializar arrays del buscador
    this.resultadosBuscadorDoctor = [];
    this.resultadosBuscadorEspecialidad = [];

    this.route.paramMap.subscribe(params => {
      const idEspecialidad = params.get('idEspecialidad');
      if (idEspecialidad) {
        this.selectedEspecialidad = idEspecialidad.toLowerCase();
      }
    });
  }

  citas = [
    // 🫀 Cardiología
    { doctor: 'Dr. Juan Pérez', especialidad: 'Cardiología', paciente: 'Luis Torres', disponibilidad: ['10:00 AM', '11:00 AM', '3:00 PM'] },
    { doctor: 'Dra. Carmen Aguilar', especialidad: 'Cardiología', paciente: 'Rosa Fernández', disponibilidad: ['9:00 AM', '1:00 PM', '4:30 PM'] },
    { doctor: 'Dr. Jorge Medina', especialidad: 'Cardiología', paciente: 'Pedro Gutiérrez', disponibilidad: ['8:30 AM', '2:00 PM'] },
    { doctor: 'Dra. Laura Campos', especialidad: 'Cardiología', paciente: 'Elena Díaz', disponibilidad: ['12:00 PM', '5:15 PM'] },

    // 🌿 Dermatología
    { doctor: 'Dra. María López', especialidad: 'Dermatología', paciente: 'Ana Castillo', disponibilidad: ['2:00 PM', '4:30 PM'] },
    { doctor: 'Dr. Luis Romero', especialidad: 'Dermatología', paciente: 'Carlos Vargas', disponibilidad: ['9:45 AM', '3:00 PM'] },
    { doctor: 'Dra. Silvia Torres', especialidad: 'Dermatología', paciente: 'Julia Herrera', disponibilidad: ['10:15 AM', '1:30 PM', '6:00 PM'] },
    { doctor: 'Dr. Daniel Flores', especialidad: 'Dermatología', paciente: 'Gabriela Rojas', disponibilidad: ['11:00 AM', '5:00 PM'] },

    // 🦴 Traumatología
    { doctor: 'Dr. Ricardo Morales', especialidad: 'Traumatología', paciente: 'Raúl Peña', disponibilidad: ['9:00 AM', '11:30 AM', '2:00 PM'] },
    { doctor: 'Dra. Patricia Sánchez', especialidad: 'Traumatología', paciente: 'Andrea Salas', disponibilidad: ['8:15 AM', '3:15 PM'] },
    { doctor: 'Dr. Esteban Cruz', especialidad: 'Traumatología', paciente: 'Héctor Ramos', disponibilidad: ['10:45 AM', '4:00 PM'] },
    { doctor: 'Dra. Fabiola Herrera', especialidad: 'Traumatología', paciente: 'Marcelo Paredes', disponibilidad: ['12:30 PM', '6:15 PM'] },

    // 👁️ Oftalmología
    { doctor: 'Dr. Alberto Gómez', especialidad: 'Oftalmología', paciente: 'Diego Fernández', disponibilidad: ['11:15 AM', '4:00 PM'] },
    { doctor: 'Dra. Carolina Vega', especialidad: 'Oftalmología', paciente: 'Sofía Delgado', disponibilidad: ['9:30 AM', '1:00 PM'] },
    { doctor: 'Dr. Martín Cárdenas', especialidad: 'Oftalmología', paciente: 'Paola Ruiz', disponibilidad: ['8:00 AM', '12:15 PM', '5:30 PM'] },
    { doctor: 'Dra. Elena Quispe', especialidad: 'Oftalmología', paciente: 'Rodrigo Mendoza', disponibilidad: ['2:45 PM', '6:00 PM'] },

    // 👩‍🍼 Ginecología
    { doctor: 'Dra. Sofía Medina', especialidad: 'Ginecología', paciente: 'Carmen Ruiz', disponibilidad: ['8:00 AM', '12:15 PM', '5:00 PM'] },
    { doctor: 'Dr. Andrés Navarro', especialidad: 'Ginecología', paciente: 'Lucía Morales', disponibilidad: ['9:45 AM', '2:30 PM'] },
    { doctor: 'Dra. Teresa Chávez', especialidad: 'Ginecología', paciente: 'Milagros Castillo', disponibilidad: ['10:30 AM', '4:45 PM'] },
    { doctor: 'Dr. Javier Campos', especialidad: 'Ginecología', paciente: 'Verónica Salazar', disponibilidad: ['11:15 AM', '3:15 PM'] },

    // 🧒 Pediatría
    { doctor: 'Dr. Carlos Ramos', especialidad: 'Pediatría', paciente: 'Miguel Díaz', disponibilidad: ['9:30 AM', '1:00 PM'] },
    { doctor: 'Dra. Natalia Guzmán', especialidad: 'Pediatría', paciente: 'Valeria Flores', disponibilidad: ['8:45 AM', '12:00 PM', '5:00 PM'] },
    { doctor: 'Dr. Felipe Lozano', especialidad: 'Pediatría', paciente: 'Esteban Bravo', disponibilidad: ['10:00 AM', '2:15 PM'] },
    { doctor: 'Dra. Andrea Torres', especialidad: 'Pediatría', paciente: 'Camila Serrano', disponibilidad: ['11:30 AM', '4:00 PM'] },

    // 🩺 Medicina General
    { doctor: 'Dr. Mario Vargas', especialidad: 'Medicina General', paciente: 'Fernando Ríos', disponibilidad: ['8:00 AM', '10:30 AM', '1:00 PM'] },
    { doctor: 'Dra. Beatriz Acosta', especialidad: 'Medicina General', paciente: 'Claudia Romero', disponibilidad: ['9:15 AM', '3:45 PM'] },
    { doctor: 'Dr. Julio Castañeda', especialidad: 'Medicina General', paciente: 'Ignacio Torres', disponibilidad: ['11:00 AM', '5:30 PM'] },
    { doctor: 'Dra. Gabriela Núñez', especialidad: 'Medicina General', paciente: 'Álvaro Quispe', disponibilidad: ['2:00 PM', '6:15 PM'] },

    // 😬 Odontología
    { doctor: 'Dra. Paula Benítez', especialidad: 'Odontología', paciente: 'Liliana Vargas', disponibilidad: ['9:00 AM', '11:30 AM', '2:45 PM'] },
    { doctor: 'Dr. Ernesto Salazar', especialidad: 'Odontología', paciente: 'Hugo Castro', disponibilidad: ['8:30 AM', '1:15 PM'] },
    { doctor: 'Dra. Valentina Rojas', especialidad: 'Odontología', paciente: 'Mariana Peña', disponibilidad: ['10:15 AM', '4:00 PM'] },
    { doctor: 'Dr. Ricardo Gálvez', especialidad: 'Odontología', paciente: 'Nicolás Herrera', disponibilidad: ['12:00 PM', '5:30 PM'] },

    // Psiquiatría
    { doctor: 'Dra. Mónica Fuentes', especialidad: 'Psiquiatría', paciente: 'Santiago León', disponibilidad: ['9:00 AM', '11:00 AM', '3:00 PM'] },
    { doctor: 'Dr. Alberto Castillo', especialidad: 'Psiquiatría', paciente: 'Isabel Moreno', disponibilidad: ['10:30 AM', '1:30 PM'] },
    { doctor: 'Dra. Claudia Rivas', especialidad: 'Psiquiatría', paciente: 'Fernando Salinas', disponibilidad: ['8:15 AM', '2:45 PM'] },
    { doctor: 'Dr. Gustavo Ponce', especialidad: 'Psiquiatría', paciente: 'Lorena Vega', disponibilidad: ['12:00 PM', '4:30 PM'] },
    // 🧠 Neurología
    { doctor: 'Dr. Enrique Palacios', especialidad: 'Neurología', paciente: 'Patricia Gómez', disponibilidad: ['9:00 AM', '1:00 PM'] },

    // 🔬 Endocrinología
    { doctor: 'Dra. Mirtha Valdez', especialidad: 'Endocrinología', paciente: 'Roberto Lozano', disponibilidad: ['10:30 AM', '3:45 PM'] },

    // 💪 Reumatología
    { doctor: 'Dr. Francisco Rojas', especialidad: 'Reumatología', paciente: 'Cecilia Vargas', disponibilidad: ['8:15 AM', '12:30 PM'] },

    // 💧 Urología
    { doctor: 'Dra. Elena Bustamante', especialidad: 'Urología', paciente: 'Oscar Medina', disponibilidad: ['11:00 AM', '4:00 PM'] }

  ];

  selectedEspecialidad: string | null = null;
  busqueda: any[] = [];

  // Variables para el buscador
  resultadosBuscadorDoctor: any[] = [];
  resultadosBuscadorEspecialidad: any[] = [];

  // Estados individuales para cada card
  cardStates: { [doctorName: string]: { diaSeleccionado: string, horarioSeleccionado: string } } = {};

  // Horarios por día para cada doctor
  horariosPorDia: { [key: string]: string[] } = {
    'jueves': ['10:20', '10:40', '11:00', '11:20', '11:40', '12:00'],
    'viernes': ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
    'sabado': ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30'],
    'lunes': ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'],
    'martes': ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00']
  };

  // Información de los días disponibles
  diasDisponibles = [
    { codigo: 'jueves', nombre: 'Jue', fecha: '04 Sep' },
    { codigo: 'viernes', nombre: 'Vie', fecha: '05 Sep' },
    { codigo: 'sabado', nombre: 'Sáb', fecha: '06 Sep' },
    { codigo: 'lunes', nombre: 'Lun', fecha: '08 Sep' },
    { codigo: 'martes', nombre: 'Mar', fecha: '09 Sep' }
  ];

  // Métodos para manejar los resultados del buscador
  onBuscarDoctor(resultados: any[]) {
    this.resultadosBuscadorDoctor = resultados;
  }

  onBuscarEspecialidad(resultados: any[]) {
    this.resultadosBuscadorEspecialidad = resultados;
  }

  get citasFiltradas() {
    let data = [...this.citas];

    // Aplicar filtro de buscador de doctor si hay resultados específicos
    if (this.resultadosBuscadorDoctor.length > 0 && this.resultadosBuscadorDoctor.length < this.citas.length) {
      data = data.filter(cita =>
        this.resultadosBuscadorDoctor.some(resultado => resultado.doctor === cita.doctor)
      );
    }

    // Aplicar filtro de buscador de especialidad si hay resultados específicos
    if (this.resultadosBuscadorEspecialidad.length > 0 && this.resultadosBuscadorEspecialidad.length < this.citas.length) {
      data = data.filter(cita =>
        this.resultadosBuscadorEspecialidad.some(resultado => resultado.especialidad === cita.especialidad)
      );
    }

    // 📌 Filtrar si viene por URL (ej: /citas/cardiologia)
    if (this.selectedEspecialidad) {
      data = data.filter(c => c.especialidad.toLowerCase() === this.selectedEspecialidad);
    }

    return data;
  }

  seleccionarEspecialidad(especialidad: string | null) {
    this.selectedEspecialidad = especialidad;
  }

  // Métodos para manejar estados individuales de cada card
  getCardState(doctorName: string) {
    if (!this.cardStates[doctorName]) {
      this.cardStates[doctorName] = {
        diaSeleccionado: 'jueves',
        horarioSeleccionado: ''
      };
    }
    return this.cardStates[doctorName];
  }

  seleccionarDiaCard(doctorName: string, dia: string) {
    const state = this.getCardState(doctorName);
    state.diaSeleccionado = dia;
    state.horarioSeleccionado = ''; // Limpiar horario al cambiar día
  }

  seleccionarHorarioCard(doctorName: string, horario: string) {
    const state = this.getCardState(doctorName);
    state.horarioSeleccionado = horario;
  }

  getHorariosDelDia(doctorName: string): string[] {
    const state = this.getCardState(doctorName);
    return this.horariosPorDia[state.diaSeleccionado] || [];
  }

  getDiaActual(doctorName: string) {
    const state = this.getCardState(doctorName);
    return this.diasDisponibles.find(d => d.codigo === state.diaSeleccionado);
  }

  onBuscarResultados(resultados: any[]) {
    this.busqueda = resultados.map(r => ({
      ...r,
      doctor: r.doctor.trim().toLowerCase(),
      especialidad: r.especialidad.trim().toLowerCase(),
      paciente: r.paciente.trim().toLowerCase()
    }));
  }

  seleccionarHorario(cita: any, horario: string) {
    const mensaje = `¿Deseas reservar una cita con ${cita.doctor} el ${horario}?`;

    if (confirm(mensaje)) {
      // Aquí podrías verificar si está logueado para proceder con la reserva
      alert(`✅ Cita reservada con ${cita.doctor} a las ${horario}. Te contactaremos pronto para confirmar.`);
    }
  }

  reservarCita(cita: any) {
    const state = this.getCardState(cita.doctor);
    if (!state.horarioSeleccionado) {
      alert('Por favor selecciona un horario primero');
      return;
    }

    // Guardar datos para el modal
    this.citaParaReservar = cita;
    this.horarioParaReservar = state.horarioSeleccionado;
    this.mostrarModal = true;
  }

  // Verificar si está logueado y proceder
  verificarYContinuar() {
    const usuario = this.authService.currentUser;

    if (usuario) {
      // Usuario logueado - continuar con el proceso
      this.procesarReservaCita();
    } else {
      // No logueado - mostrar opciones de autenticación
      this.mostrarOpcionesAuth();
    }
  }

  mostrarOpcionesAuth() {
    const mensaje = '¿Ya tienes una cuenta?\n\n' +
      '✅ SÍ - Inicia sesión\n' +
      '❌ NO - Regístrate primero';

    if (confirm(mensaje)) {
      // Ir a login
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: '/citas',
          reserva: 'pendiente',
          doctor: this.citaParaReservar.doctor,
          horario: this.horarioParaReservar
        }
      });
    } else {
      // Ir a registro
      this.router.navigate(['/registro'], {
        queryParams: {
          returnUrl: '/citas',
          reserva: 'pendiente',
          doctor: this.citaParaReservar.doctor,
          horario: this.horarioParaReservar
        }
      });
    }
  }

  procesarReservaCita() {
    if (!this.datosCita.motivo.trim()) {
      alert('Por favor indica el motivo de la consulta');
      return;
    }

    // Redirección directa al checkout si los datos son válidos
    const usuario = this.authService.currentUser;
    console.log('Usuario:', usuario);
    console.log('Cita:', this.citaParaReservar);
    if (usuario?.rol === 'paciente' && this.citaParaReservar) {
      this.router.navigate(['/checkout'], {
        queryParams: {
          doctor: this.citaParaReservar.doctor,
          especialidad: this.citaParaReservar.especialidad,
          fecha: new Date().toISOString().split('T')[0],
          hora: this.horarioParaReservar
        }
      });
    }
    this.cerrarModal();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.citaParaReservar = null;
    this.horarioParaReservar = '';
    this.datosCita = {
      motivo: '',
      tipoConsulta: 'consulta-general',
      observaciones: ''
    };
  }

  irALogin() {
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: '/citas',
        reserva: 'pendiente'
      }
    });
  }

  irARegistro() {
    this.router.navigate(['/registro'], {
      queryParams: {
        returnUrl: '/citas',
        reserva: 'pendiente'
      }
    });
  }

  get estaLogueado(): boolean {
    return !!this.authService.currentUser;
  }

}
