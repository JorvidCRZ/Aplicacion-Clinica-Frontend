import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../../core/services/rol/auth.service';
import { Doctor } from '../../../../../core/models/users/doctor';

// 📊 Interfaces para Dashboard Doctor
interface EstadisticaGeneral {
  citasHoy: number;
  citasSemana: number;
  citasMes: number;
  totalPacientes: number;
  pacientesNuevos: number;
  citasPendientes: number;
  citasCompletadas: number;
  horasConsulta: number;
  eficiencia: number;
}

interface CitaResumen {
  id: number;
  hora: string;
  paciente: string;
  tipo: string;
  estado: 'siguiente' | 'programada' | 'completada';
  duracion: number;
}

interface PacienteReciente {
  id: number;
  nombre: string;
  ultimaCita: string;
  proximaCita?: string;
  estado: 'critico' | 'seguimiento' | 'control' | 'nuevo';
  diagnostico: string;
}

interface ActividadReciente {
  id: number;
  tipo: 'cita' | 'diagnostico' | 'tratamiento' | 'nota';
  descripcion: string;
  paciente: string;
  fecha: string;
  hora: string;
}
@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resumen.component.html',
  styleUrl: './resumen.component.css'
})
export class ResumenComponent implements OnInit {
  private authService = inject(AuthService);
  
  // 👨‍⚕️ Doctor actual
  doctorActual: Doctor | null = null;
  
  // 📊 Estadísticas generales
  estadisticas: EstadisticaGeneral = {
    citasHoy: 0,
    citasSemana: 0,
    citasMes: 0,
    totalPacientes: 0,
    pacientesNuevos: 0,
    citasPendientes: 0,
    citasCompletadas: 0,
    horasConsulta: 0,
    eficiencia: 0
  };
  
  // 📅 Citas del día
  citasHoy: CitaResumen[] = [];
  proximaCita: CitaResumen | null = null;
  
  // 👥 Pacientes recientes
  pacientesRecientes: PacienteReciente[] = [];
  
  // 📄 Actividades recientes
  actividadesRecientes: ActividadReciente[] = [];
  
  // 🕰️ Fecha y hora actual
  fechaActual = new Date();
  horaActual = '';
  
  // 🏆 Métricas de rendimiento
  metricasRendimiento = {
    puntualidad: 95,
    satisfaccionPacientes: 98,
    tiempoPromedioCita: 32,
    derivacionesEfectivas: 87
  };

  ngOnInit(): void {
    this.obtenerDoctorActual();
    this.actualizarHora();
    this.cargarEstadisticas();
    this.cargarCitasHoy();
    this.cargarPacientesRecientes();
    this.cargarActividadesRecientes();
    
    // Actualizar hora cada minuto
    setInterval(() => this.actualizarHora(), 60000);
  }
  
  // 👨‍⚕️ Obtener doctor logueado
  private obtenerDoctorActual(): void {
    this.authService.authState$.subscribe(authState => {
      if (authState.isLoggedIn && authState.user?.rol === 'doctor') {
        this.doctorActual = authState.user as Doctor;
        console.log('👨‍⚕️ Doctor en resumen:', this.doctorActual);
      }
    });
  }
  
  // 🕰️ Actualizar hora actual
  private actualizarHora(): void {
    this.fechaActual = new Date();
    this.horaActual = this.fechaActual.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // 📊 Cargar estadísticas generales
  private cargarEstadisticas(): void {
    // Simular datos basados en la especialidad del doctor
    const especialidad = this.doctorActual?.especialidad || 'Medicina General';
    
    this.estadisticas = {
      citasHoy: this.generarCitasDelDia(especialidad),
      citasSemana: 28,
      citasMes: 115,
      totalPacientes: this.calcularPacientesPorEspecialidad(especialidad),
      pacientesNuevos: 12,
      citasPendientes: 8,
      citasCompletadas: 4,
      horasConsulta: 6.5,
      eficiencia: 94
    };
  }
  
  // 📅 Cargar citas del día
  private cargarCitasHoy(): void {
    const especialidad = this.doctorActual?.especialidad || 'Medicina General';
    
    this.citasHoy = [
      {
        id: 1,
        hora: '08:00',
        paciente: 'María García L.',
        tipo: this.obtenerTipoConsultaPorEspecialidad(especialidad),
        estado: 'completada',
        duracion: 30
      },
      {
        id: 2,
        hora: '08:30',
        paciente: 'Carlos Rodríguez M.',
        tipo: this.obtenerTipoConsultaPorEspecialidad(especialidad),
        estado: 'completada',
        duracion: 45
      },
      {
        id: 3,
        hora: '09:15',
        paciente: 'Ana Martínez S.',
        tipo: this.obtenerTipoConsultaPorEspecialidad(especialidad),
        estado: 'siguiente',
        duracion: 30
      },
      {
        id: 4,
        hora: '10:00',
        paciente: 'Luis Fernández C.',
        tipo: this.obtenerTipoConsultaPorEspecialidad(especialidad),
        estado: 'programada',
        duracion: 30
      },
      {
        id: 5,
        hora: '10:30',
        paciente: 'Patricia Jiménez V.',
        tipo: this.obtenerTipoConsultaPorEspecialidad(especialidad),
        estado: 'programada',
        duracion: 60
      }
    ];
    
    // Encontrar próxima cita
    this.proximaCita = this.citasHoy.find(cita => cita.estado === 'siguiente') || null;
  }
  
  // 👥 Cargar pacientes recientes
  private cargarPacientesRecientes(): void {
    const especialidad = this.doctorActual?.especialidad || 'Medicina General';
    
    this.pacientesRecientes = [
      {
        id: 1,
        nombre: 'Roberto Sánchez T.',
        ultimaCita: '2025-09-29',
        proximaCita: '2025-10-15',
        estado: 'seguimiento',
        diagnostico: this.obtenerDiagnosticoPorEspecialidad(especialidad)
      },
      {
        id: 2,
        nombre: 'Carmen Delgado R.',
        ultimaCita: '2025-09-28',
        estado: 'control',
        diagnostico: this.obtenerDiagnosticoPorEspecialidad(especialidad)
      },
      {
        id: 3,
        nombre: 'Javier Morales D.',
        ultimaCita: '2025-09-27',
        proximaCita: '2025-10-10',
        estado: 'critico',
        diagnostico: this.obtenerDiagnosticoPorEspecialidad(especialidad)
      },
      {
        id: 4,
        nombre: 'Isabella Torres M.',
        ultimaCita: '2025-09-30',
        estado: 'nuevo',
        diagnostico: 'Primera consulta'
      }
    ];
  }
  
  // 📄 Cargar actividades recientes
  private cargarActividadesRecientes(): void {
    this.actividadesRecientes = [
      {
        id: 1,
        tipo: 'cita',
        descripcion: 'Cita completada con seguimiento',
        paciente: 'María García L.',
        fecha: '2025-09-30',
        hora: '08:00'
      },
      {
        id: 2,
        tipo: 'diagnostico',
        descripcion: 'Diagnóstico actualizado',
        paciente: 'Carlos Rodríguez M.',
        fecha: '2025-09-30',
        hora: '08:30'
      },
      {
        id: 3,
        tipo: 'tratamiento',
        descripcion: 'Plan de tratamiento modificado',
        paciente: 'Ana Martínez S.',
        fecha: '2025-09-29',
        hora: '16:45'
      },
      {
        id: 4,
        tipo: 'nota',
        descripcion: 'Nota médica agregada',
        paciente: 'Luis Fernández C.',
        fecha: '2025-09-29',
        hora: '14:20'
      }
    ];
  }
  
  // 🏅 Métodos auxiliares para especialidades
  private generarCitasDelDia(especialidad: string): number {
    const citasPorEspecialidad: { [key: string]: number } = {
      'Cardiología': 8,
      'Medicina General': 12,
      'Pediatría': 15,
      'Dermatología': 10,
      'Neurología': 6
    };
    return citasPorEspecialidad[especialidad] || 10;
  }
  
  private calcularPacientesPorEspecialidad(especialidad: string): number {
    const pacientesPorEspecialidad: { [key: string]: number } = {
      'Cardiología': 245,
      'Medicina General': 380,
      'Pediatría': 420,
      'Dermatología': 180,
      'Neurología': 125
    };
    return pacientesPorEspecialidad[especialidad] || 200;
  }
  
  private obtenerTipoConsultaPorEspecialidad(especialidad: string): string {
    const tiposPorEspecialidad: { [key: string]: string[] } = {
      'Cardiología': ['Control Cardiológico', 'Electrocardiograma', 'Ecocardiograma', 'Consulta Urgente'],
      'Medicina General': ['Consulta General', 'Control de Cronicós', 'Chequeo Preventivo', 'Consulta Aguda'],
      'Pediatría': ['Control Niño Sano', 'Vacunación', 'Consulta Pediátrica', 'Urgencia Pediátrica'],
      'Dermatología': ['Consulta Dermatológica', 'Control de Lunares', 'Tratamiento Acné', 'Dermatoscopia'],
      'Neurología': ['Consulta Neurológica', 'Control Epilepsia', 'Evaluación Cognitiva', 'Electroencefalograma']
    };
    const tipos = tiposPorEspecialidad[especialidad] || ['Consulta General'];
    return tipos[Math.floor(Math.random() * tipos.length)];
  }
  
  private obtenerDiagnosticoPorEspecialidad(especialidad: string): string {
    const diagnosticosPorEspecialidad: { [key: string]: string[] } = {
      'Cardiología': ['Hipertensión Arterial', 'Arritmia Cardíaca', 'Insuficiencia Cardíaca', 'Angina de Pecho'],
      'Medicina General': ['Diabetes Mellitus', 'Hipertensión', 'Dislipidemia', 'Síndrome Metabólico'],
      'Pediatría': ['Desarrollo Normal', 'Infección Respiratoria', 'Gastroenteritis', 'Alergia Alimentaria'],
      'Dermatología': ['Dermatitis Atópica', 'Acné Vulgar', 'Psoriasis', 'Melanoma'],
      'Neurología': ['Migraña', 'Epilepsia', 'Neuropatía', 'Esclerosis Múltiple']
    };
    const diagnosticos = diagnosticosPorEspecialidad[especialidad] || ['Diagnóstico General'];
    return diagnosticos[Math.floor(Math.random() * diagnosticos.length)];
  }
  
  // 🚀 Acciones rápidas
  iniciarSiguienteCita(): void {
    if (this.proximaCita) {
      alert(`Iniciando cita con ${this.proximaCita.paciente} a las ${this.proximaCita.hora}`);
    } else {
      alert('No hay próxima cita programada');
    }
  }
  
  verTodasLasCitas(): void {
    // Navegar al componente de citas
    console.log('Navegando a todas las citas...');
  }
  
  verTodosLosPacientes(): void {
    // Navegar al componente de pacientes
    console.log('Navegando a todos los pacientes...');
  }
  
  // 📅 Utilidades de fecha
  obtenerFechaFormateada(): string {
    return this.fechaActual.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  obtenerSaludoSegunHora(): string {
    const hora = this.fechaActual.getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
