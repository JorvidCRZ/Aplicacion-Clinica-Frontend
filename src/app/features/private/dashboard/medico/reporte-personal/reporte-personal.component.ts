import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { CitaService } from '../../../../../core/services/logic/cita.service';
import { CitaCompleta } from '../../../../../core/models/common/cita';

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
  private citasSrv = inject(CitaService);

  // 👨‍⚕️ Doctor actual
  doctorActual: DoctorVM | null = null;

  // 🗂️ Citas
  citas: CitaCompleta[] = [];
  citasDoctor: CitaCompleta[] = [];

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
    const usuario: any = this.authService.currentUser;
    if (!usuario) {
      console.error('❌ No hay usuario logueado');
      return;
    }
    const p = usuario.persona || {};
    const correo = usuario.correo || '';
    const especialidadLS = localStorage.getItem(`medico_especialidad:${correo}`) || undefined;
    this.doctorActual = {
      id: usuario.idUsuario || 0,
      nombre: `${p.nombre1 || ''}`.trim(),
      apellidoPaterno: p.apellidoPaterno || '',
      correo,
      especialidad: especialidadLS
    };
    console.log('👨‍⚕️ Doctor cargado:', this.doctorActual);
  }

  // 📊 Generar reporte personalizado
  generarReporte(): void {
    if (!this.doctorActual) return;
    this.cargando = true;

    // Seed si no hay citas para mostrar demo coherente
    const nombreDoctor = `${this.doctorActual.nombre} ${this.doctorActual.apellidoPaterno || ''}`.trim();
    this.citasSrv.seedIfEmptyForDoctor(nombreDoctor, this.doctorActual.especialidad);
    // Cargar y filtrar citas por el doctor
    this.citas = this.citasSrv.obtenerCitas();
    this.citasDoctor = this.filtrarCitasPorDoctor(this.citas);

    // Secciones del reporte
    this.cargarMetricas();
    this.cargarCitasHoy();
    this.cargarDiagnosticosComunes();
    this.cargarActividadSemanal();

    this.cargando = false;
  }

  private filtrarCitasPorDoctor(citas: CitaCompleta[]): CitaCompleta[] {
    if (!this.doctorActual) return citas;
    const nombreDoctor = `${this.doctorActual.nombre} ${this.doctorActual.apellidoPaterno || ''}`.trim().toLowerCase();
    const esp = (this.doctorActual.especialidad || '').toLowerCase();
    return citas.filter(c => {
      const byEsp = esp ? (c.especialidad || '').toLowerCase() === esp : false;
      const byNombre = c.doctorNombre ? c.doctorNombre.toLowerCase() === nombreDoctor : false;
      return byEsp || byNombre;
    });
  }

  // 📈 Cargar métricas principales
  private cargarMetricas(): void {
    const rango = this.obtenerRangoPeriodo(this.periodoSeleccionado);
    const enRango = this.citasDoctor.filter(c => this.enRangoFecha(c.fecha, rango.inicio, rango.fin));
    const completadas = enRango.filter(c => c.estado === 'completada');
    const pendientes = enRango.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada');

    const pacientesUnicos = new Set(enRango.map(c => c.pacienteEmail).filter(Boolean));

    const promMin = completadas.length
      ? Math.round(completadas.reduce((acc, c) => acc + (c.duracionEstimada || 30), 0) / completadas.length)
      : 30;

    this.metricas = [
      {
        titulo: 'Citas Atendidas',
        valor: completadas.length,
        icono: 'fas fa-calendar-check',
        color: '#28a745',
        cambio: '-',
        tendencia: 'neutral'
      },
      {
        titulo: 'Pacientes Activos',
        valor: pacientesUnicos.size,
        icono: 'fas fa-users',
        color: '#007bff',
        cambio: '-',
        tendencia: 'neutral'
      },
      {
        titulo: 'Tiempo Promedio',
        valor: `${promMin} min`,
        icono: 'fas fa-clock',
        color: '#17a2b8',
        cambio: '-',
        tendencia: 'neutral'
      }
    ];
  }

  // 📅 Cargar citas de hoy
  private cargarCitasHoy(): void {
    const hoy = this.fechaISO(new Date());
    const hoyCitas = this.citasDoctor
      .filter(c => c.fecha === hoy)
      .sort((a, b) => this.buildDateTime(a.fecha, a.hora).getTime() - this.buildDateTime(b.fecha, b.hora).getTime());
    this.citasHoy = hoyCitas.map(c => ({
      hora: c.hora,
      paciente: this.nombreCorto(c.pacienteNombre),
      tipo: c.tipoConsulta,
      estado: c.estado === 'completada' ? 'completada' : (c.estado === 'cancelada' ? 'cancelada' : 'pendiente')
    }));
  }

  // 🏥 Cargar diagnósticos según especialidad
  private cargarDiagnosticosComunes(): void {
    // Top tipos de consulta por frecuencia en el período seleccionado
    const rango = this.obtenerRangoPeriodo(this.periodoSeleccionado);
    const enRango = this.citasDoctor.filter(c => this.enRangoFecha(c.fecha, rango.inicio, rango.fin));
    const conteo = new Map<string, number>();
    for (const c of enRango) {
      const k = c.tipoConsulta || 'Consulta';
      conteo.set(k, (conteo.get(k) || 0) + 1);
    }
    const total = Array.from(conteo.values()).reduce((a, b) => a + b, 0) || 1;
    const items = Array.from(conteo.entries())
      .map(([nombre, cantidad]) => ({ nombre, cantidad, porcentaje: Math.round((cantidad / total) * 100) }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
    this.diagnosticosEspecialidad = items;
  }

  // 📈 Actividad semanal simple
  private cargarActividadSemanal(): void {
    const semana = this.rangoSemanaActual();
    const dias: any[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(semana.inicio);
      d.setDate(semana.inicio.getDate() + i);
      const iso = this.fechaISO(d);
      const delDia = this.citasDoctor.filter(c => c.fecha === iso);
      dias.push({
        fecha: iso,
        completadas: delDia.filter(c => c.estado === 'completada').length,
        pendientes: delDia.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada').length,
        canceladas: delDia.filter(c => c.estado === 'cancelada').length
      });
    }
    this.actividadSemanal = dias;
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

// Tipos y utilidades locales
interface DoctorVM {
  id: number;
  nombre: string;
  apellidoPaterno?: string;
  correo: string;
  especialidad?: string;
  nroColegiado?: string;
}

export interface ReportePersonalComponent {
  fechaISO(d: Date): string;
  buildDateTime(fecha: string, hora: string): Date;
  enRangoFecha(fecha: string, ini: Date, fin: Date): boolean;
  rangoSemanaActual(): { inicio: Date; fin: Date };
  rangoMesActual(): { inicio: Date; fin: Date };
  obtenerRangoPeriodo(periodo: string): { inicio: Date; fin: Date };
  nombreCorto(nombre: string): string;
}

ReportePersonalComponent.prototype.fechaISO = function(d: Date): string {
  return d.toISOString().split('T')[0];
};

ReportePersonalComponent.prototype.buildDateTime = function(fecha: string, hora: string): Date {
  const [h, m] = (hora || '00:00').split(':').map(Number);
  return new Date(`${fecha}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`);
};

ReportePersonalComponent.prototype.enRangoFecha = function(fecha: string, ini: Date, fin: Date): boolean {
  const f = new Date(fecha + 'T00:00:00');
  const i = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate());
  const e = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate());
  return f >= i && f <= e;
};

ReportePersonalComponent.prototype.rangoSemanaActual = function(): { inicio: Date; fin: Date } {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diffLunes = (dia === 0 ? -6 : 1) - dia;
  const inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() + diffLunes);
  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  return { inicio, fin };
};

ReportePersonalComponent.prototype.rangoMesActual = function(): { inicio: Date; fin: Date } {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  return { inicio, fin };
};

ReportePersonalComponent.prototype.obtenerRangoPeriodo = function(periodo: string): { inicio: Date; fin: Date } {
  const hoy = new Date();
  if (periodo === 'resumen' || periodo === 'hoy') {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const fin = new Date(inicio);
    return { inicio, fin };
  }
  if (periodo === 'semana') {
    return this.rangoSemanaActual();
  }
  return this.rangoMesActual();
};

ReportePersonalComponent.prototype.nombreCorto = function(nombre: string): string {
  const partes = (nombre || '').split(' ');
  if (partes.length >= 2) return `${partes[0]} ${partes[1][0]}.`;
  return nombre || '';
};
