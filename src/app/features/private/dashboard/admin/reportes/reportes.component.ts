import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// 📊 Interfaces para Reportes
interface FiltroReporte {
  fechaInicio: string;
  fechaFin: string;
  tipo: 'general' | 'citas' | 'doctores' | 'pacientes' | 'ingresos';
  formato: 'tabla' | 'grafico' | 'export';
}

interface ReporteCitas {
  fecha: string;
  total: number;
  confirmadas: number;
  completadas: number;
  canceladas: number;
  pendientes: number;
  ingresos: number;
}

interface ReporteDoctores {
  doctor: string;
  especialidad: string;
  totalCitas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  ingresosTotales: number;
  promedioDiario: number;
}

interface ReportePacientes {
  mes: string;
  nuevosRegistros: number;
  citasPromedio: number;
  frecuenciaTratamientos: number;
}

interface DatoGrafico {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  
  // 📋 Configuración de filtros
  filtro: FiltroReporte = {
    fechaInicio: this.obtenerFechaInicio(),
    fechaFin: this.obtenerFechaActual(),
    tipo: 'general',
    formato: 'tabla'
  };

  // 📊 Datos de reportes
  reporteCitas: ReporteCitas[] = [];
  reporteDoctores: ReporteDoctores[] = [];
  reportePacientes: ReportePacientes[] = [];
  datosGrafico: DatoGrafico[] = [];

  // 🎯 Configuración de vista
  vistaActual: 'tabla' | 'grafico' | 'resumen' = 'resumen';
  cargandoReporte = false;

  // 📈 Resumen general
  resumenGeneral = {
    totalCitas: 0,
    totalIngresos: 0,
    promedioMensual: 0,
    crecimientoMensual: 0,
    doctorMasActivo: '',
    especialidadMasDemandada: ''
  };

  ngOnInit(): void {
    this.generarReporte();
  }

  // 📊 Generar reporte según filtros
  generarReporte(): void {
    this.cargandoReporte = true;
    
    setTimeout(() => {
      switch (this.filtro.tipo) {
        case 'general':
          this.generarReporteGeneral();
          break;
        case 'citas':
          this.generarReporteCitas();
          break;
        case 'doctores':
          this.generarReporteDoctores();
          break;
        case 'pacientes':
          this.generarReportePacientes();
          break;
        case 'ingresos':
          this.generarReporteIngresos();
          break;
      }
      this.cargandoReporte = false;
    }, 1000);
  }

  // 📋 Reporte General
  private generarReporteGeneral(): void {
    // Simular datos del reporte general
    this.resumenGeneral = {
      totalCitas: 342,
      totalIngresos: 15420000,
      promedioMensual: 5140000,
      crecimientoMensual: 12.5,
      doctorMasActivo: 'Dr. Carlos Rodríguez',
      especialidadMasDemandada: 'Cardiología'
    };

    this.datosGrafico = [
      { label: 'Citas Completadas', value: 78, color: '#28a745' },
      { label: 'Citas Pendientes', value: 15, color: '#ffc107' },
      { label: 'Citas Canceladas', value: 7, color: '#dc3545' }
    ];

    // Generar también datos para las tablas
    this.generarReporteCitas();
    this.generarReporteDoctores();
    this.generarReportePacientes();
  }

  // 📅 Reporte de Citas
  private generarReporteCitas(): void {
    this.reporteCitas = [
      {
        fecha: '2024-01-15',
        total: 25,
        confirmadas: 20,
        completadas: 18,
        canceladas: 2,
        pendientes: 5,
        ingresos: 890000
      },
      {
        fecha: '2024-01-16',
        total: 22,
        confirmadas: 18,
        completadas: 16,
        canceladas: 1,
        pendientes: 5,
        ingresos: 780000
      },
      {
        fecha: '2024-01-17',
        total: 28,
        confirmadas: 24,
        completadas: 22,
        canceladas: 3,
        pendientes: 3,
        ingresos: 1050000
      }
    ];
  }

  // 👨‍⚕️ Reporte de Doctores
  private generarReporteDoctores(): void {
    this.reporteDoctores = [
      {
        doctor: 'Dr. Carlos Rodríguez',
        especialidad: 'Cardiología',
        totalCitas: 85,
        citasCompletadas: 78,
        citasCanceladas: 7,
        ingresosTotales: 3250000,
        promedioDiario: 108333
      },
      {
        doctor: 'Dra. Ana Martínez',
        especialidad: 'Pediatría',
        totalCitas: 72,
        citasCompletadas: 68,
        citasCanceladas: 4,
        ingresosTotales: 2890000,
        promedioDiario: 96333
      },
      {
        doctor: 'Dr. Luis García',
        especialidad: 'Traumatología',
        totalCitas: 65,
        citasCompletadas: 60,
        citasCanceladas: 5,
        ingresosTotales: 2750000,
        promedioDiario: 91667
      }
    ];
  }

  // 👥 Reporte de Pacientes
  private generarReportePacientes(): void {
    this.reportePacientes = [
      {
        mes: 'Enero 2024',
        nuevosRegistros: 45,
        citasPromedio: 2.3,
        frecuenciaTratamientos: 1.8
      },
      {
        mes: 'Febrero 2024',
        nuevosRegistros: 52,
        citasPromedio: 2.1,
        frecuenciaTratamientos: 1.9
      },
      {
        mes: 'Marzo 2024',
        nuevosRegistros: 38,
        citasPromedio: 2.5,
        frecuenciaTratamientos: 2.1
      }
    ];
  }

  // 💰 Reporte de Ingresos
  private generarReporteIngresos(): void {
    this.datosGrafico = [
      { label: 'Enero', value: 4200000, color: '#2363B9' },
      { label: 'Febrero', value: 4850000, color: '#28a745' },
      { label: 'Marzo', value: 5320000, color: '#ffc107' },
      { label: 'Abril', value: 4980000, color: '#dc3545' }
    ];
  }

  // 📥 Exportar reporte
  exportarReporte(formato: 'pdf' | 'excel' | 'csv'): void {
    const mensaje = `Exportando reporte en formato ${formato.toUpperCase()}...`;
    console.log(mensaje);
    
    // Simular descarga
    setTimeout(() => {
      alert(`✅ Reporte exportado exitosamente en formato ${formato.toUpperCase()}`);
    }, 1500);
  }

  // 🔄 Actualizar datos
  actualizarDatos(): void {
    this.generarReporte();
  }

  // 📊 Cambiar vista
  cambiarVista(vista: 'tabla' | 'grafico' | 'resumen'): void {
    this.vistaActual = vista;
  }

  // 🗓️ Métodos auxiliares de fechas
  private obtenerFechaActual(): string {
    return new Date().toISOString().split('T')[0];
  }

  private obtenerFechaInicio(): string {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - 1);
    return fecha.toISOString().split('T')[0];
  }

  // 💰 Formatear moneda
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency: 'COP'
    }).format(valor);
  }

  // 📈 Calcular porcentaje
  calcularPorcentaje(parte: number, total: number): number {
    return total > 0 ? Math.round((parte / total) * 100) : 0;
  }

  // 🎨 Obtener clase de tendencia
  obtenerClaseTendencia(valor: number): string {
    if (valor > 0) return 'positiva';
    if (valor < 0) return 'negativa';
    return 'neutral';
  }
}
