import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { CitaService } from '../../../../../core/services/logic/cita.service';
import { CitaCompleta } from '../../../../../core/models/common/cita';

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
  private citasSrv = inject(CitaService);
  
  // 👨‍⚕️ Doctor actual
  doctorActual: DoctorVM | null = null;

  // 🗂️ Citas (todas y filtradas por doctor)
  citas: CitaCompleta[] = [];
  citasDoctor: CitaCompleta[] = [];
  
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
    this.cargarDatos();
    
    // Actualizar hora cada minuto
    setInterval(() => this.actualizarHora(), 60000);
  }
  
  // 👨‍⚕️ Obtener doctor logueado
  private obtenerDoctorActual(): void {
    const user: any = this.authService.currentUser;
    if (!user) return;
    const p = user.persona || {};
    const correo = user.correo || '';
    const especialidadLS = localStorage.getItem(`medico_especialidad:${correo}`) || undefined;
    this.doctorActual = {
      id: user.idUsuario || 0,
      nombre: `${p.nombre1 || ''}`.trim(),
      apellidoPaterno: p.apellidoPaterno || '',
      correo,
      especialidad: especialidadLS
    };
    console.log('👨‍⚕️ Doctor en resumen:', this.doctorActual);
  }

  // 📥 Cargar data base para el dashboard
  private cargarDatos(): void {
    // Obtener todas las citas
    // Seed si no hay citas para mostrar demo coherente
    if (this.doctorActual) {
      const nombreDoctor = `${this.doctorActual.nombre} ${this.doctorActual.apellidoPaterno || ''}`.trim();
      this.citasSrv.seedIfEmptyForDoctor(nombreDoctor, this.doctorActual.especialidad);
    }
    this.citas = this.citasSrv.obtenerCitas();
    // Filtrar a las del doctor actual (por especialidad o nombre del médico)
    this.citasDoctor = this.filtrarCitasPorDoctor(this.citas);

    // Derivar tarjetas/estadísticas y secciones
    this.cargarEstadisticas();
    this.cargarCitasHoy();
    this.cargarPacientesRecientes();
    this.cargarActividadesRecientes();
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
  
  // 🕰️ Actualizar hora actual
  private actualizarHora(): void {
    this.fechaActual = new Date();
    this.horaActual = this.fechaActual.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // 📊 Cargar estadísticas generales (dinámico)
  private cargarEstadisticas(): void {
    const hoy = this.fechaISO(new Date());
    const ahora = new Date();

    const enSemana = this.rangoSemanaActual();
    const enMes = this.rangoMesActual();

    const citasHoy = this.citasDoctor.filter(c => c.fecha === hoy);
    const citasSemana = this.citasDoctor.filter(c => this.enRangoFecha(c.fecha, enSemana.inicio, enSemana.fin));
    const citasMes = this.citasDoctor.filter(c => this.enRangoFecha(c.fecha, enMes.inicio, enMes.fin));

    const pendientes = this.citasDoctor.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada');
    const completadas = this.citasDoctor.filter(c => c.estado === 'completada');

    // Pacientes únicos por email
    const pacientesUnicos = new Set(this.citasDoctor.map(c => c.pacienteEmail).filter(Boolean));

    // Pacientes nuevos del mes: primera cita del paciente en este mes
    const pacientesNuevos = this.calcularPacientesNuevosDelMes(this.citasDoctor, enMes.inicio, enMes.fin);

    const horasConsulta = citasHoy.reduce((acc, c) => acc + (c.duracionEstimada || 30), 0) / 60;
    const totalConsideradas = pendientes.length + completadas.length;
    const eficiencia = totalConsideradas > 0 ? Math.round((completadas.length / totalConsideradas) * 100) : 94;

    this.estadisticas = {
      citasHoy: citasHoy.length,
      citasSemana: citasSemana.length,
      citasMes: citasMes.length,
      totalPacientes: pacientesUnicos.size,
      pacientesNuevos,
      citasPendientes: pendientes.length,
      citasCompletadas: completadas.length,
      horasConsulta: Math.round(horasConsulta * 10) / 10,
      eficiencia
    };
  }
  
  // 📅 Cargar citas del día (dinámico)
  private cargarCitasHoy(): void {
    const hoy = this.fechaISO(new Date());
    const ahora = new Date();
    const citasHoy = this.citasDoctor
      .filter(c => c.fecha === hoy)
      .sort((a, b) => this.buildDateTime(a.fecha, a.hora).getTime() - this.buildDateTime(b.fecha, b.hora).getTime());

    // Determinar próxima cita (primera programada con hora >= ahora)
    const proxima = citasHoy.find(c => (c.estado === 'pendiente' || c.estado === 'confirmada') && this.buildDateTime(c.fecha, c.hora) >= ahora) || null;
    this.proximaCita = proxima ? this.mapCitaResumen(proxima, 'siguiente') : null;

    // Mapear todas las citas del día
    this.citasHoy = citasHoy.map(c => {
      const estadoResumen: CitaResumen['estado'] = c.estado === 'completada' ? 'completada' : 'programada';
      // Marcar la próxima como 'siguiente'
      if (proxima && c.id === proxima.id) return this.mapCitaResumen(c, 'siguiente');
      return this.mapCitaResumen(c, estadoResumen);
    });
  }
  
  // 👥 Cargar pacientes recientes (dinámico)
  private cargarPacientesRecientes(): void {
    // Agrupar por pacienteEmail y obtener última/proxima cita
    const porPaciente = new Map<string, CitaCompleta[]>();
    for (const c of this.citasDoctor) {
      const key = c.pacienteEmail || c.pacienteNombre;
      if (!porPaciente.has(key)) porPaciente.set(key, []);
      porPaciente.get(key)!.push(c);
    }
    const items: PacienteReciente[] = [];
    porPaciente.forEach((lista, key) => {
      lista.sort((a, b) => this.buildDateTime(b.fecha, b.hora).getTime() - this.buildDateTime(a.fecha, a.hora).getTime());
      const ultima = lista[0];
      const proxima = lista.find(c => c.estado === 'pendiente' || c.estado === 'confirmada');
      const visitas = lista.length;
      const estado: PacienteReciente['estado'] = visitas === 1 ? 'nuevo' : (visitas >= 3 ? 'seguimiento' : 'control');
      items.push({
        id: Math.abs(this.hashCode(key)),
        nombre: this.nombreCorto(ultima.pacienteNombre),
        ultimaCita: ultima.fecha,
        proximaCita: proxima?.fecha,
        estado,
        diagnostico: ultima.tipoConsulta
      });
    });
    // Tomar los 4 más recientes por última cita
    this.pacientesRecientes = items
      .sort((a, b) => new Date(b.ultimaCita).getTime() - new Date(a.ultimaCita).getTime())
      .slice(0, 4);
  }
  
  // 📄 Cargar actividades recientes (dinámico)
  private cargarActividadesRecientes(): void {
    const recientes = [...this.citasDoctor]
      .sort((a, b) => this.buildDateTime(b.fecha, b.hora).getTime() - this.buildDateTime(a.fecha, a.hora).getTime())
      .slice(0, 6);
    this.actividadesRecientes = recientes.map((c, idx) => ({
      id: c.id || idx + 1,
      tipo: 'cita',
      descripcion: `Cita ${c.estado}`,
      paciente: this.nombreCorto(c.pacienteNombre),
      fecha: c.fecha,
      hora: c.hora
    }));
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

// Tipos/Utilidades locales
interface DoctorVM {
  id: number;
  nombre: string;
  apellidoPaterno?: string;
  correo: string;
  especialidad?: string;
}

// Helpers
function pad2(n: number): string { return n.toString().padStart(2, '0'); }

// Nota: Los siguientes métodos se anexan a la clase para mantener el estilo del componente.
export interface ResumenComponent {
  fechaISO(d: Date): string;
  buildDateTime(fecha: string, hora: string): Date;
  enRangoFecha(fecha: string, ini: Date, fin: Date): boolean;
  rangoSemanaActual(): { inicio: Date; fin: Date };
  rangoMesActual(): { inicio: Date; fin: Date };
  calcularPacientesNuevosDelMes(citas: CitaCompleta[], ini: Date, fin: Date): number;
  mapCitaResumen(c: CitaCompleta, estado: 'siguiente' | 'programada' | 'completada'): CitaResumen;
  nombreCorto(nombre: string): string;
  hashCode(s: string): number;
}

ResumenComponent.prototype.fechaISO = function(d: Date): string {
  return d.toISOString().split('T')[0];
};

ResumenComponent.prototype.buildDateTime = function(fecha: string, hora: string): Date {
  const [h, m] = (hora || '00:00').split(':').map(Number);
  const dt = new Date(`${fecha}T${pad2(h)}:${pad2(m)}:00`);
  return dt;
};

ResumenComponent.prototype.enRangoFecha = function(fecha: string, ini: Date, fin: Date): boolean {
  const f = new Date(fecha + 'T00:00:00');
  return f >= new Date(ini.toDateString()) && f <= new Date(fin.toDateString());
};

ResumenComponent.prototype.rangoSemanaActual = function(): { inicio: Date; fin: Date } {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0 domingo ... 6 sábado
  const diffLunes = (dia === 0 ? -6 : 1) - dia; // mover a lunes
  const inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() + diffLunes);
  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  return { inicio, fin };
};

ResumenComponent.prototype.rangoMesActual = function(): { inicio: Date; fin: Date } {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  return { inicio, fin };
};

ResumenComponent.prototype.calcularPacientesNuevosDelMes = function(citas: CitaCompleta[], ini: Date, fin: Date): number {
  const primerCitaPorPaciente = new Map<string, string>();
  for (const c of citas) {
    const key = c.pacienteEmail || c.pacienteNombre;
    const actual = primerCitaPorPaciente.get(key);
    if (!actual || new Date(c.fecha) < new Date(actual)) {
      primerCitaPorPaciente.set(key, c.fecha);
    }
  }
  let nuevos = 0;
  primerCitaPorPaciente.forEach(fecha => {
    if (this.enRangoFecha(fecha, ini, fin)) nuevos++;
  });
  return nuevos;
};

ResumenComponent.prototype.mapCitaResumen = function(c: CitaCompleta, estado: 'siguiente' | 'programada' | 'completada'): CitaResumen {
  return {
    id: c.id,
    hora: c.hora,
    paciente: this.nombreCorto(c.pacienteNombre),
    tipo: c.tipoConsulta,
    estado,
    duracion: c.duracionEstimada || 30
  };
};

ResumenComponent.prototype.nombreCorto = function(nombre: string): string {
  const partes = (nombre || '').split(' ');
  if (partes.length >= 2) {
    return `${partes[0]} ${partes[1].charAt(0)}.`;
  }
  return nombre || '';
};

ResumenComponent.prototype.hashCode = function(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return h;
};
