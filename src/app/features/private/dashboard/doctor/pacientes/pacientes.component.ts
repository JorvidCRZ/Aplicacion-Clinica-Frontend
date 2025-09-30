import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  ngOnInit(): void {
    this.cargarPacientes();
    this.calcularEstadisticas();
    this.filtrarPacientes();
  }

  // 👥 Cargar pacientes de ejemplo
  private cargarPacientes(): void {
    this.pacientesOriginales = [
      {
        id: 1,
        nombre: 'María García López',
        documento: '12345678',
        edad: 45,
        genero: 'femenino',
        telefono: '3001234567',
        email: 'maria.garcia@email.com',
        ultimaCita: '2025-09-25',
        ultimoDiagnostico: 'Hipertensión Arterial',
        fechaRegistro: '2023-06-15'
      },
      {
        id: 2,
        nombre: 'Carlos Rodríguez Méndez',
        documento: '87654321',
        edad: 38,
        genero: 'masculino',
        telefono: '3009876543',
        email: 'carlos.rodriguez@email.com',
        ultimaCita: '2025-09-27',
        ultimoDiagnostico: 'Control Cardiovascular',
        fechaRegistro: '2023-08-20'
      },
      {
        id: 3,
        nombre: 'Ana Martínez Silva',
        documento: '11223344',
        edad: 52,
        genero: 'femenino',
        telefono: '3005556789',
        email: 'ana.martinez@email.com',
        ultimaCita: '2025-09-23',
        ultimoDiagnostico: 'Diabetes Mellitus Tipo 2',
        fechaRegistro: '2023-04-10'
      },
      {
        id: 4,
        nombre: 'Luis Fernández Castro',
        documento: '55667788',
        edad: 29,
        genero: 'masculino',
        telefono: '3002223333',
        email: 'luis.fernandez@email.com',
        ultimaCita: '2025-09-15',
        ultimoDiagnostico: 'Chequeo General',
        fechaRegistro: '2023-12-01'
      },
      {
        id: 5,
        nombre: 'Patricia Jiménez Vega',
        documento: '99887766',
        edad: 67,
        genero: 'femenino',
        telefono: '3007778888',
        email: 'patricia.jimenez@email.com',
        ultimaCita: '2025-09-28',
        ultimoDiagnostico: 'Arritmia Cardíaca',
        fechaRegistro: '2023-02-28'
      },
      {
        id: 6,
        nombre: 'Roberto Sánchez Torres',
        documento: '44556677',
        edad: 41,
        genero: 'masculino',
        telefono: '3004445555',
        email: 'roberto.sanchez@email.com',
        ultimaCita: '2025-09-29',
        ultimoDiagnostico: 'Post-operatorio Bypass',
        fechaRegistro: '2025-01-15'
      },
      {
        id: 7,
        nombre: 'Carmen Delgado Ruiz',
        documento: '33445566',
        edad: 33,
        genero: 'femenino',
        telefono: '3006667777',
        email: 'carmen.delgado@email.com',
        ultimaCita: '2025-09-26',
        ultimoDiagnostico: 'Prevención Cardiovascular',
        fechaRegistro: '2025-01-20'
      },
      {
        id: 8,
        nombre: 'Javier Morales Díaz',
        documento: '22334455',
        edad: 56,
        genero: 'masculino',
        telefono: '3008889999',
        email: 'javier.morales@email.com',
        ultimaCita: '2025-09-24',
        ultimoDiagnostico: 'Insuficiencia Cardíaca',
        fechaRegistro: '2023-09-12'
      }
    ];
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
