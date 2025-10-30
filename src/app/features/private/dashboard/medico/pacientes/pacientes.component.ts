import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../../../../core/services/logic/cita.service';
import { CitaCompleta } from '../../../../../core/models/common/cita';
import { AuthService } from '../../../../../core/services/auth/auth.service';

// 👤 Interfaces para gestión de pacientes
interface Paciente {
  id: number;
  nombre: string;
  documento: string;
  edad: number;
  genero: 'masculino' | 'femenino' | 'otro';
  telefono: string;
  email: string;
  ultimaCita: string;
  ultimoDiagnostico: string;
  fechaRegistro: string;
}

interface EstadisticasPacientes {
  porEdad: { [key: string]: number };
  porGenero: { masculino: number; femenino: number; otro: number };
  diagnosticosFrecuentes: { nombre: string; cantidad: number }[];
}

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css'
})
export class PacientesComponent implements OnInit {

  // 📊 Datos de pacientes
  pacientesOriginales: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];

  // 🎛️ Filtros y búsqueda
  busquedaTexto = '';
  filtroEdad = '';
  ordenamiento = 'nombre';
  vistaActual: 'tarjetas' | 'tabla' = 'tabla'; // Tabla por defecto para eficiencia

  // 📈 Estadísticas
  totalPacientes = 0;
  totalCitas = 0;
  citasEsteMes = 0;
  
  estadisticas: EstadisticasPacientes = {
    porEdad: {},
    porGenero: { masculino: 0, femenino: 0, otro: 0 },
    diagnosticosFrecuentes: []
  };

  constructor(private citasSrv: CitaService, private auth: AuthService) {}

  ngOnInit(): void {
    this.cargarPacientes();
    this.calcularEstadisticas();
    this.filtrarPacientes();
  }

  // 👥 Cargar pacientes dinámicos desde las Citas, filtrados por especialidad o por el propio médico
  private cargarPacientes(): void {
    const user = this.auth.currentUser;
    const doctorNombre = (user?.persona as any)?.nombre || `${(user?.persona as any)?.nombre1 || ''} ${(user?.persona as any)?.apellidoPaterno || ''}`.trim();

    // Posible especialidad asociada al médico guardada en localStorage (opcional)
    // Clave ejemplo: `medico_especialidad:<correo>` -> string nombre de especialidad
    const correo = user?.correo || '';
    const especialidadDoctor = localStorage.getItem(`medico_especialidad:${correo}`) || '';

    const citas: CitaCompleta[] = this.citasSrv.obtenerCitas();

    // Filtrar citas que correspondan al médico o a su especialidad (si existe)
    const citasFiltradas = citas.filter(c => {
      const porNombre = doctorNombre ? (c.doctorNombre?.toLowerCase() === doctorNombre.toLowerCase()) : false;
      const porEsp = especialidadDoctor ? (c.especialidad?.toLowerCase() === especialidadDoctor.toLowerCase()) : false;
      return porNombre || porEsp;
    });

    // Mapear a pacientes únicos por email (si no hay email, por nombre)
    const mapa = new Map<string, Paciente>();
    let genId = 1;
    for (const c of citasFiltradas) {
      const key = (c.pacienteEmail || c.pacienteNombre).toLowerCase();
      const existente = mapa.get(key);
      if (!existente) {
        mapa.set(key, {
          id: genId++,
          nombre: c.pacienteNombre,
          documento: '',
          edad: c.pacienteEdad || 0,
          genero: 'otro',
          telefono: c.pacienteTelefono || '',
          email: c.pacienteEmail || '',
          ultimaCita: c.fecha,
          ultimoDiagnostico: c.motivoConsulta || '—',
          fechaRegistro: c.fechaCreacion
        });
      } else {
        // Actualizar última cita si esta es más reciente
        if (new Date(c.fecha).getTime() > new Date(existente.ultimaCita).getTime()) {
          existente.ultimaCita = c.fecha;
          existente.ultimoDiagnostico = c.motivoConsulta || existente.ultimoDiagnostico;
        }
      }
    }

    this.pacientesOriginales = Array.from(mapa.values());
  }

  // 📊 Calcular estadísticas
  private calcularEstadisticas(): void {
    this.totalPacientes = this.pacientesOriginales.length;
    this.totalCitas = this.pacientesOriginales.length * 3; // Simulación: promedio 3 citas por paciente
    this.citasEsteMes = this.pacientesOriginales.filter(p => 
      new Date(p.ultimaCita).getMonth() === new Date().getMonth()
    ).length;

    // Estadísticas por edad
    this.estadisticas.porEdad = {
      '0-17': this.pacientesOriginales.filter(p => p.edad <= 17).length,
      '18-39': this.pacientesOriginales.filter(p => p.edad >= 18 && p.edad <= 39).length,
      '40-64': this.pacientesOriginales.filter(p => p.edad >= 40 && p.edad <= 64).length,
      '65+': this.pacientesOriginales.filter(p => p.edad >= 65).length
    };

    // Estadísticas por género
    this.estadisticas.porGenero = {
      masculino: this.pacientesOriginales.filter(p => p.genero === 'masculino').length,
      femenino: this.pacientesOriginales.filter(p => p.genero === 'femenino').length,
      otro: this.pacientesOriginales.filter(p => p.genero === 'otro').length
    };

    // Diagnósticos frecuentes
    const diagnosticos: { [key: string]: number } = {};
    this.pacientesOriginales.forEach(p => {
      diagnosticos[p.ultimoDiagnostico] = (diagnosticos[p.ultimoDiagnostico] || 0) + 1;
    });

    this.estadisticas.diagnosticosFrecuentes = Object.entries(diagnosticos)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }

  // 🔍 Filtrar pacientes
  filtrarPacientes(): void {
    this.pacientesFiltrados = this.pacientesOriginales.filter(paciente => {
      const cumpleTexto = !this.busquedaTexto || 
        paciente.nombre.toLowerCase().includes(this.busquedaTexto.toLowerCase()) ||
        paciente.documento.includes(this.busquedaTexto) ||
        paciente.telefono.includes(this.busquedaTexto);

      const cumpleEdad = !this.filtroEdad || this.verificarRangoEdad(paciente.edad, this.filtroEdad);

      return cumpleTexto && cumpleEdad;
    });

    this.aplicarOrdenamiento();
  }

  // 🎯 Verificar rango de edad
  private verificarRangoEdad(edad: number, rango: string): boolean {
    switch (rango) {
      case '0-17': return edad <= 17;
      case '18-39': return edad >= 18 && edad <= 39;
      case '40-64': return edad >= 40 && edad <= 64;
      case '65+': return edad >= 65;
      default: return true;
    }
  }

  // 📊 Aplicar ordenamiento
  aplicarOrdenamiento(): void {
    this.pacientesFiltrados.sort((a, b) => {
      switch (this.ordenamiento) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'nombre-desc':
          return b.nombre.localeCompare(a.nombre);
        case 'fecha-desc':
          return new Date(b.ultimaCita).getTime() - new Date(a.ultimaCita).getTime();
        case 'fecha-asc':
          return new Date(a.ultimaCita).getTime() - new Date(b.ultimaCita).getTime();
        case 'edad-asc':
          return a.edad - b.edad;
        case 'edad-desc':
          return b.edad - a.edad;
        default:
          return 0;
      }
    });
  }

  // 🧹 Limpiar filtros
  limpiarFiltros(): void {
    this.busquedaTexto = '';
    this.filtroEdad = '';
    this.ordenamiento = 'nombre';
    this.filtrarPacientes();
  }

  // 👁️ Cambiar vista
  cambiarVista(vista: 'tarjetas' | 'tabla'): void {
    this.vistaActual = vista;
  }

  // ⚡ Acciones de pacientes
  verHistorial(paciente: Paciente): void {
    console.log('Ver historial de:', paciente.nombre);
    // Aquí navegarías al historial del paciente
  }

  nuevaCita(paciente: Paciente): void {
    console.log('Nueva cita para:', paciente.nombre);
    // Aquí abrirías el formulario de nueva cita
  }

  contactarPaciente(paciente: Paciente): void {
    console.log('Contactar a:', paciente.nombre);
    // Aquí mostrarías las opciones de contacto
  }
}
