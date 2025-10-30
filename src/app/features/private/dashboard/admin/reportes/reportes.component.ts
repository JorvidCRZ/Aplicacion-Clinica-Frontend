import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CitaService } from '../../../../../core/services/logic/cita.service';
import { PagosService, Factura as FacturaLocal } from '../../../../../core/services/logic/pagos.service';
import { CitaCompleta } from '../../../../../core/models/common/cita';

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
  constructor(private citaService: CitaService, private pagosService: PagosService) {}
  
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

  // Datos base del sistema
  private todasCitas: CitaCompleta[] = [];
  private todasFacturas: FacturaLocal[] = [];

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
    // Cargar datos del sistema
    this.todasCitas = this.citaService.obtenerCitas();
    this.todasFacturas = this.pagosService.obtenerFacturas();
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
    const { inicio, fin } = this.obtenerRangoFechas();
    const citas = this.todasCitas.filter(c => this.estaEnRango(new Date(c.fecha), inicio, fin));
    const factPagadas = this.todasFacturas.filter(f => f.estado === 'pagado' && this.estaEnRango(new Date(f.fecha), inicio, fin));

    const totalCitas = citas.length;
    const totalIngresos = factPagadas.reduce((s, f) => s + (f.total || 0), 0);

    // Promedio mensual y crecimiento
    const ingresosPorMes = this.agruparPorMes(factPagadas);
    const meses = Object.keys(ingresosPorMes).sort();
    const promedioMensual = meses.length ? meses.reduce((s, m) => s + ingresosPorMes[m], 0) / meses.length : 0;
    const crecimientoMensual = this.calcularCrecimientoMensual(ingresosPorMes);

    // Doctor más activo y especialidad más demandada
    const doctorMasActivo = this.obtenerMaximoPor(citas.map(c => c.doctorNombre));
    const especialidadMasDemandada = this.obtenerMaximoPor(citas.map(c => c.especialidad));

    this.resumenGeneral = {
      totalCitas,
      totalIngresos,
      promedioMensual,
      crecimientoMensual,
      doctorMasActivo: doctorMasActivo || '-',
      especialidadMasDemandada: especialidadMasDemandada || '-'
    };

    // Gráfico de estados de citas
    const completadas = citas.filter(c => c.estado === 'completada').length;
    const confirmadas = citas.filter(c => c.estado === 'confirmada').length;
    const canceladas = citas.filter(c => c.estado === 'cancelada').length;
    const pendientes = citas.filter(c => c.estado === 'pendiente').length;

    this.datosGrafico = [
      { label: 'Completadas', value: completadas, color: '#28a745' },
      { label: 'Confirmadas', value: confirmadas, color: '#2363B9' },
      { label: 'Pendientes', value: pendientes, color: '#ffc107' },
      { label: 'Canceladas', value: canceladas, color: '#dc3545' }
    ];

    this.generarReporteCitas();
    this.generarReporteDoctores();
    this.generarReportePacientes();
  }

  // 📅 Reporte de Citas
  private generarReporteCitas(): void {
    const { inicio, fin } = this.obtenerRangoFechas();
    const citas = this.todasCitas.filter(c => this.estaEnRango(new Date(c.fecha), inicio, fin));
    const facturas = this.todasFacturas.filter(f => f.estado === 'pagado' && this.estaEnRango(new Date(f.fecha), inicio, fin));

    // Agrupar por fecha (YYYY-MM-DD)
    const mapa: Record<string, ReporteCitas> = {};
    for (const c of citas) {
      const key = new Date(c.fecha).toISOString().split('T')[0];
      if (!mapa[key]) {
        mapa[key] = { fecha: key, total: 0, confirmadas: 0, completadas: 0, canceladas: 0, pendientes: 0, ingresos: 0 };
      }
      mapa[key].total += 1;
      if (c.estado === 'confirmada') mapa[key].confirmadas += 1;
      else if (c.estado === 'completada') mapa[key].completadas += 1;
      else if (c.estado === 'cancelada') mapa[key].canceladas += 1;
      else mapa[key].pendientes += 1;
    }
    for (const f of facturas) {
      const key = new Date(f.fecha).toISOString().split('T')[0];
      if (!mapa[key]) {
        mapa[key] = { fecha: key, total: 0, confirmadas: 0, completadas: 0, canceladas: 0, pendientes: 0, ingresos: 0 };
      }
      mapa[key].ingresos += f.total || 0;
    }
    this.reporteCitas = Object.values(mapa).sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  // 👨‍⚕️ Reporte de Doctores
  private generarReporteDoctores(): void {
    const { inicio, fin } = this.obtenerRangoFechas();
    const citas = this.todasCitas.filter(c => this.estaEnRango(new Date(c.fecha), inicio, fin));
    const facturas = this.todasFacturas.filter(f => f.estado === 'pagado' && this.estaEnRango(new Date(f.fecha), inicio, fin));

    const porDoctor = new Map<string, ReporteDoctores>();
    for (const c of citas) {
      const key = `${c.doctorNombre}|||${c.especialidad}`;
      if (!porDoctor.has(key)) {
        porDoctor.set(key, {
          doctor: c.doctorNombre,
          especialidad: c.especialidad,
          totalCitas: 0,
          citasCompletadas: 0,
          citasCanceladas: 0,
          ingresosTotales: 0,
          promedioDiario: 0
        });
      }
      const r = porDoctor.get(key)!;
      r.totalCitas += 1;
      if (c.estado === 'completada') r.citasCompletadas += 1;
      if (c.estado === 'cancelada') r.citasCanceladas += 1;
    }
    for (const f of facturas) {
      // Usar doctor en factura para asociar ingresos
      const key = `${f.doctor}|||${f.especialidad}`;
      if (!porDoctor.has(key)) {
        porDoctor.set(key, {
          doctor: f.doctor,
          especialidad: f.especialidad,
          totalCitas: 0,
          citasCompletadas: 0,
          citasCanceladas: 0,
          ingresosTotales: 0,
          promedioDiario: 0
        });
      }
      const r = porDoctor.get(key)!;
      r.ingresosTotales += f.total || 0;
    }

    // Calcular promedio diario simple en el rango
    const dias = Math.max(1, Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)));
    this.reporteDoctores = Array.from(porDoctor.values()).map(r => ({
      ...r,
      promedioDiario: r.ingresosTotales / dias
    })).sort((a, b) => b.ingresosTotales - a.ingresosTotales);
  }

  // 👥 Reporte de Pacientes
  private generarReportePacientes(): void {
    // Mantener una tabla simple por ahora (sin fuente directa de registros de pacientes)
    const { inicio, fin } = this.obtenerRangoFechas();
    const meses = this.obtenerMesesEnRango(inicio, fin);
    this.reportePacientes = meses.map(m => ({
      mes: m,
      nuevosRegistros: Math.floor(Math.random() * 20) + 10, // placeholder dinámico
      citasPromedio: +(Math.random() * 2 + 1).toFixed(1),
      frecuenciaTratamientos: +(Math.random() * 2).toFixed(1)
    }));
  }

  // 💰 Reporte de Ingresos
  private generarReporteIngresos(): void {
    const { inicio, fin } = this.obtenerRangoFechas();
    const facturas = this.todasFacturas.filter(f => f.estado === 'pagado' && this.estaEnRango(new Date(f.fecha), inicio, fin));
    const porMes = this.agruparPorMes(facturas);
    const claves = Object.keys(porMes).sort();
    const paleta = ['#2363B9', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8'];
    this.datosGrafico = claves.map((k, i) => ({ label: this.formatearMes(k), value: porMes[k], color: paleta[i % paleta.length] }));
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
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      currencyDisplay: 'symbol'
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

  // ===== Helpers internos =====
  private obtenerRangoFechas(): { inicio: Date; fin: Date } {
    const inicio = new Date(this.filtro.fechaInicio + 'T00:00:00');
    const fin = new Date(this.filtro.fechaFin + 'T23:59:59');
    return { inicio, fin };
  }

  private estaEnRango(fecha: Date, inicio: Date, fin: Date): boolean {
    return fecha.getTime() >= inicio.getTime() && fecha.getTime() <= fin.getTime();
  }

  private agruparPorMes(items: Array<{ fecha: string; total?: number }>): Record<string, number> {
    const mapa: Record<string, number> = {};
    for (const it of items) {
      const d = new Date(it.fecha);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      mapa[key] = (mapa[key] || 0) + (it.total || 0);
    }
    return mapa;
  }

  private calcularCrecimientoMensual(ingresosPorMes: Record<string, number>): number {
    const meses = Object.keys(ingresosPorMes).sort();
    if (meses.length < 2) return 0;
    const ultimo = ingresosPorMes[meses[meses.length - 1]];
    const previo = ingresosPorMes[meses[meses.length - 2]] || 0;
    if (previo === 0) return 0;
    return +(((ultimo - previo) / previo) * 100).toFixed(1);
  }

  private obtenerMaximoPor(valores: string[]): string | null {
    const contador: Record<string, number> = {};
    for (const v of valores) contador[v] = (contador[v] || 0) + 1;
    let max = 0, res: string | null = null;
    for (const k in contador) { if (contador[k] > max) { max = contador[k]; res = k; } }
    return res;
  }

  private obtenerMesesEnRango(inicio: Date, fin: Date): string[] {
    const meses: string[] = [];
    const cur = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    while (cur <= fin) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
      meses.push(this.formatearMes(key));
      cur.setMonth(cur.getMonth() + 1);
    }
    return meses;
  }

  private formatearMes(key: string): string {
    const [y, m] = key.split('-');
    const fecha = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return fecha.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  }
}
