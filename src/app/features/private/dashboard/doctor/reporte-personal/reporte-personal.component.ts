import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth.service';
import { Doctor } from '../../../../../core/models/users/doctor';

// 📊 Interfaces para el Reporte
interface MetricaDoctor {
  titulo: string;
  valor: number | string;
  icono: string;
  color: string;
  cambio: string;
  tendencia: 'up' | 'down' | 'neutral';
}

interface CitaDelDia {
  hora: string;
  paciente: string;
  tipo: string;
  estado: 'completada' | 'pendiente' | 'cancelada';
}

interface DiagnosticoEspecialidad {
  nombre: string;
  cantidad: number;
  porcentaje: number;
}

@Component({
  selector: 'app-reporte-personal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-personal.component.html',
  styleUrls: ['./reporte-personal.component.css']
})
export class ReportePersonalComponent implements OnInit {

  // 🔧 Servicios
  private authService = inject(AuthService);

  // 👨‍⚕️ Doctor actual
  doctorActual: Doctor | null = null;

  // 📊 Datos del reporte
  metricas: MetricaDoctor[] = [];
  citasHoy: CitaDelDia[] = [];
  diagnosticosEspecialidad: DiagnosticoEspecialidad[] = [];
  actividadSemanal: any[] = [];
  
  // 🎛️ Configuración de tabs
  tabs = [
    { id: 'resumen', nombre: 'Resumen', icono: 'fas fa-chart-pie' },
    { id: 'diagnosticos', nombre: 'Diagnósticos', icono: 'fas fa-stethoscope' },
    { id: 'productividad', nombre: 'Productividad', icono: 'fas fa-tasks' }
  ];
  
  tabActivo = 'resumen';
  periodoSeleccionado = 'mes';
  cargandoReporte = false;

  // 🎛️ Vista actual
  vistaActiva = 'resumen';

  // ⏳ Estado de carga
  cargando = false;

  ngOnInit(): void {
    this.cargarDoctorActual();
    this.generarReporte();
  }

  // 👨‍⚕️ Cargar información del doctor logueado
  cargarDoctorActual(): void {
    const usuario = this.authService.currentUser;
    
    if (usuario && 'especialidad' in usuario && usuario.rol === 'doctor') {
      this.doctorActual = usuario as Doctor;
      console.log('👨‍⚕️ Doctor cargado:', this.doctorActual);
    } else {
      console.error('❌ No hay doctor logueado');
    }
  }

  // 📊 Generar reporte personalizado
  generarReporte(): void {
    if (!this.doctorActual) return;
    
    this.cargando = true;
    
    setTimeout(() => {
      this.cargarMetricas();
      this.cargarCitasHoy();
      this.cargarDiagnosticosComunes();
      this.cargando = false;
    }, 1000);
  }

  // 📈 Cargar métricas principales
  private cargarMetricas(): void {
    this.metricas = [
      {
        titulo: 'Citas Atendidas',
        valor: 24,
        icono: 'fas fa-calendar-check',
        color: '#28a745',
        cambio: '+8%',
        tendencia: 'up'
      },
      {
        titulo: 'Pacientes Activos',
        valor: 156,
        icono: 'fas fa-users',
        color: '#007bff',
        cambio: '+5%',
        tendencia: 'up'
      },
      {
        titulo: 'Tiempo Promedio',
        valor: '25 min',
        icono: 'fas fa-clock',
        color: '#17a2b8',
        cambio: '-3 min',
        tendencia: 'up'
      }
    ];
  }

  // 📅 Cargar citas de hoy
  private cargarCitasHoy(): void {
    this.citasHoy = [
      {
        hora: '09:00',
        paciente: 'María González',
        tipo: 'Consulta',
        estado: 'completada'
      },
      {
        hora: '10:30',
        paciente: 'Juan Pérez',
        tipo: 'Control',
        estado: 'completada'
      },
      {
        hora: '14:00',
        paciente: 'Ana López',
        tipo: 'Consulta',
        estado: 'pendiente'
      },
      {
        hora: '15:30',
        paciente: 'Carlos Ruiz',
        tipo: 'Urgencia',
        estado: 'pendiente'
      }
    ];
  }

  // 🏥 Cargar diagnósticos según especialidad
  private cargarDiagnosticosComunes(): void {
    const especialidad = this.doctorActual?.especialidad?.toLowerCase() || 'medicina general';
    
    const diagnosticosPorEspecialidad: { [key: string]: DiagnosticoEspecialidad[] } = {
      'cardiología': [
        { nombre: 'Hipertensión Arterial', cantidad: 45, porcentaje: 35 },
        { nombre: 'Arritmias', cantidad: 28, porcentaje: 22 },
        { nombre: 'Insuficiencia Cardíaca', cantidad: 18, porcentaje: 14 },
        { nombre: 'Angina de Pecho', cantidad: 15, porcentaje: 12 },
        { nombre: 'Infarto', cantidad: 8, porcentaje: 6 }
      ],
      'pediatría': [
        { nombre: 'Infecciones Respiratorias', cantidad: 52, porcentaje: 40 },
        { nombre: 'Gastroenteritis', cantidad: 25, porcentaje: 19 },
        { nombre: 'Dermatitis', cantidad: 20, porcentaje: 15 },
        { nombre: 'Asma', cantidad: 18, porcentaje: 14 },
        { nombre: 'Otitis', cantidad: 12, porcentaje: 9 }
      ],
      'medicina general': [
        { nombre: 'Gripe y Resfriados', cantidad: 38, porcentaje: 30 },
        { nombre: 'Hipertensión', cantidad: 25, porcentaje: 20 },
        { nombre: 'Diabetes', cantidad: 20, porcentaje: 16 },
        { nombre: 'Gastritis', cantidad: 18, porcentaje: 14 },
        { nombre: 'Migrañas', cantidad: 12, porcentaje: 10 }
      ]
    };

    this.diagnosticosEspecialidad = diagnosticosPorEspecialidad[especialidad] || 
                               diagnosticosPorEspecialidad['medicina general'];
  }

  // 🎛️ Cambiar vista
  cambiarVista(vista: string): void {
    this.vistaActiva = vista;
  }

  // 🔄 Actualizar datos
  actualizarDatos(): void {
    this.generarReporte();
  }
  
  // 🔄 Actualizar reporte por período
  actualizarReporte(): void {
    this.cargandoReporte = true;
    setTimeout(() => {
      this.generarReporte();
      this.cargandoReporte = false;
    }, 1000);
  }
  
  // 📋 Cambiar tab activo
  cambiarTab(tabId: string): void {
    this.tabActivo = tabId;
  }
  
  // � Obtener iniciales del doctor
  obtenerIniciales(): string {
    if (!this.doctorActual) return 'DR';
    const nombre = this.doctorActual.nombre || '';
    const apellido = this.doctorActual.apellidoPaterno || '';
    return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
  }
  
  // 👨‍⚕️ Obtener nombre completo del doctor
  obtenerNombreCompleto(): string {
    if (!this.doctorActual) return 'Doctor';
    return `Dr. ${this.doctorActual.nombre} ${this.doctorActual.apellidoPaterno || ''}`.trim();
  }
  
  // 📄 Exportar reporte
  exportarReporte(formato: 'pdf' | 'excel'): void {
    console.log(`Exportando reporte en formato ${formato}`);
    alert(`📄 Exportando reporte en formato ${formato.toUpperCase()}...`);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'completada': return 'estado-completada';
      case 'pendiente': return 'estado-pendiente';
      case 'cancelada': return 'estado-cancelada';
      default: return '';
    }
  }

}
