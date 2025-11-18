import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { CitaService } from '../../../../../core/services/logic/cita.service';
import { CitaCompleta } from '../../../../../core/models/common/cita';

interface Cita {
  id: number;
  fecha: string;
  hora: string;
  doctor: {
    nombre: string;
    apellido: string;
    especialidad: string;
    avatar?: string;
  };
  tipo: string;
  motivo: string;
  estado: 'programada' | 'completada' | 'cancelada' | 'no-show';
  precio: number;
  instrucciones?: string;
  consultorio: string;
  duracion: number; // en minutos
  puedeReagendar: boolean;
  puedeCancelar: boolean;
}

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-citas.component.html',
  styleUrls: ['./mis-citas.component.css']
})
export class MisCitasComponent implements OnInit {
  private authService = inject(AuthService);
  private citaService = inject(CitaService);
  private router = inject(Router);

  // Datos del paciente
  pacienteActual: any = null;

  // Citas
  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  citasProximas: Cita[] = [];
  citasHistorial: Cita[] = [];

  // Filtros
  filtroFecha: string = '';
  filtroEstado: string = '';
  filtroDoctorEspecialidad: string = '';
  filtroActivo: 'proximas' | 'historial' | 'todas' = 'proximas';

  // Paginación
  paginaActual = 1;
  registrosPorPagina = 8;
  totalPaginas = 1;

  // Estadísticas
  estadisticas = {
    total: 0,
    programadas: 0,
    completadas: 0,
    canceladas: 0
  };

  ngOnInit() {
    this.cargarDatosPaciente();
    this.cargarCitas();
  }

  cargarDatosPaciente() {
    this.pacienteActual = this.authService.currentUser;
  }

  cargarCitas() {
    // Base mock de ejemplo
    this.citas = [
      {
        id: 1,
        fecha: '2025-10-05',
        hora: '09:00',
        doctor: {
          nombre: 'Dr. Carlos',
          apellido: 'Mendoza',
          especialidad: 'Cardiología',
          avatar: 'assets/doctores/cardiologo.webp'
        },
        tipo: 'Consulta General',
        motivo: 'Control cardiológico rutinario',
        estado: 'programada',
        precio: 150,
        instrucciones: 'Traer estudios previos y venir en ayunas',
        consultorio: 'Consultorio 201',
        duracion: 30,
        puedeReagendar: true,
        puedeCancelar: true
      },
      {
        id: 2,
        fecha: '2025-09-20',
        hora: '14:30',
        doctor: {
          nombre: 'Dra. Ana',
          apellido: 'García',
          especialidad: 'Dermatología',
          avatar: 'assets/doctores/dermatologo.webp'
        },
        tipo: 'Consulta Especializada',
        motivo: 'Revisión de lunares',
        estado: 'completada',
        precio: 120,
        consultorio: 'Consultorio 105',
        duracion: 45,
        puedeReagendar: false,
        puedeCancelar: false
      },
      {
        id: 3,
        fecha: '2025-10-12',
        hora: '16:00',
        doctor: {
          nombre: 'Dr. Luis',
          apellido: 'Rodríguez',
          especialidad: 'Pediatría',
          avatar: 'assets/doctores/pediatra.webp'
        },
        tipo: 'Control Pediátrico',
        motivo: 'Control de crecimiento y desarrollo',
        estado: 'programada',
        precio: 100,
        instrucciones: 'Traer carnet de vacunas',
        consultorio: 'Consultorio 301',
        duracion: 30,
        puedeReagendar: true,
        puedeCancelar: true
      }
    ];

    // Mezclar con citas guardadas localmente (por email del paciente actual)
    this.cargarCreadasPorPaciente();

    this.calcularEstadisticas();
    this.separarCitas();
    this.aplicarFiltros();
  }

  private cargarCreadasPorPaciente() {
    const correo = this.pacienteActual?.correo;
    if (!correo) return;
    const todas: CitaCompleta[] = this.citaService.obtenerCitas();
    const mias = todas.filter(c => (c.pacienteEmail || '').toLowerCase() === correo.toLowerCase());
    const mapeadas: Cita[] = mias.map(c => ({
      id: c.id,
      fecha: c.fecha,
      hora: c.hora,
      doctor: {
        nombre: c.doctorNombre.split(' ')[0] || c.doctorNombre,
        apellido: c.doctorNombre.split(' ').slice(1).join(' '),
        especialidad: c.especialidad
      },
      tipo: c.tipoConsulta,
      motivo: c.motivoConsulta,
      estado: (c.estado === 'confirmada' ? 'programada' : (c.estado as any)),
      // Usar el precio guardado en la cita (desde checkout). Si no existe, hacer fallback por especialidad.
      precio: (c as any).precio ?? this.obtenerPrecioPorEspecialidad(c.especialidad),
      consultorio: 'Por asignar',
      duracion: c.duracionEstimada || 30,
      puedeReagendar: true,
      puedeCancelar: true
    }));

    const idsExistentes = new Set(this.citas.map(ci => ci.id));
    for (const ci of mapeadas) {
      if (!idsExistentes.has(ci.id)) {
        this.citas.unshift(ci);
      }
    }
  }

  private obtenerPrecioPorEspecialidad(especialidad: string): number {
    const precios: Record<string, number> = {
      'Cardiología': 150,
      'Dermatología': 120,
      'Pediatría': 100,
      'Ginecología': 130,
      'Medicina General': 80,
      'Traumatología': 140,
      'Psicología': 110,
      'Odontología': 90,
      'Oftalmología': 110,
      'Neurología': 160,
      'Endocrinología': 150,
      'Reumatología': 140,
      'Urología': 130
    };
    return precios[especialidad] ?? 100;
  }

  calcularEstadisticas() {
    this.estadisticas = {
      total: this.citas.length,
      programadas: this.citas.filter(c => c.estado === 'programada').length,
      completadas: this.citas.filter(c => c.estado === 'completada').length,
      canceladas: this.citas.filter(c => c.estado === 'cancelada').length
    };
  }

  separarCitas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    this.citasProximas = this.citas.filter(cita => {
      const fechaCita = new Date(cita.fecha);
      return fechaCita >= hoy && cita.estado === 'programada';
    }).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    this.citasHistorial = this.citas.filter(cita => {
      const fechaCita = new Date(cita.fecha);
      return fechaCita < hoy || cita.estado !== 'programada';
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  aplicarFiltros() {
    let citasBase: Cita[] = [];
    
    switch (this.filtroActivo) {
      case 'proximas':
        citasBase = this.citasProximas;
        break;
      case 'historial':
        citasBase = this.citasHistorial;
        break;
      case 'todas':
        citasBase = this.citas;
        break;
    }

    this.citasFiltradas = citasBase.filter(cita => {
      const cumpleFecha = !this.filtroFecha || cita.fecha.includes(this.filtroFecha);
      const cumpleEstado = !this.filtroEstado || cita.estado === this.filtroEstado;
      const cumpleDoctor = !this.filtroDoctorEspecialidad || 
        cita.doctor.nombre.toLowerCase().includes(this.filtroDoctorEspecialidad.toLowerCase()) ||
        cita.doctor.apellido.toLowerCase().includes(this.filtroDoctorEspecialidad.toLowerCase()) ||
        cita.doctor.especialidad.toLowerCase().includes(this.filtroDoctorEspecialidad.toLowerCase());

      return cumpleFecha && cumpleEstado && cumpleDoctor;
    });

    this.calcularPaginacion();
  }

  calcularPaginacion() {
    this.totalPaginas = Math.ceil(this.citasFiltradas.length / this.registrosPorPagina);
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = 1;
    }
  }

  get citasPaginadas(): Cita[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.citasFiltradas.slice(inicio, fin);
  }

  cambiarFiltro(filtro: 'proximas' | 'historial' | 'todas') {
    this.filtroActivo = filtro;
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    // Resetear todos los filtros de búsqueda y volver a la vista 'todas'
    this.filtroFecha = '';
    this.filtroEstado = '';
    this.filtroDoctorEspecialidad = '';
    this.filtroActivo = 'todas';
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  verDetalleCita(cita: Cita) {
    console.log('Ver detalle de cita:', cita);
    // Implementar modal o navegación a detalle
  }

  cancelarCita(cita: Cita) {
    if (confirm(`¿Estás seguro de cancelar la cita del ${this.formatearFecha(cita.fecha)} a las ${cita.hora}?`)) {
      cita.estado = 'cancelada';
      cita.puedeCancelar = false;
      cita.puedeReagendar = false;
      
      this.calcularEstadisticas();
      this.separarCitas();
      this.aplicarFiltros();
      
      alert('Cita cancelada exitosamente');
    }
  }

  reagendarCita(cita: Cita) {
    console.log('Reagendar cita:', cita);
    // Implementar modal o navegación a reagendamiento
    alert('Funcionalidad de reagendamiento próximamente');
  }

  descargarComprobante(cita: Cita) {
    console.log('Descargar comprobante:', cita);
    // Implementar descarga de PDF
    alert('Descargando comprobante...');
  }

  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearHora(hora: string): string {
    const [horas, minutos] = hora.split(':');
    const horaNum = parseInt(horas);
    const periodo = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum > 12 ? horaNum - 12 : horaNum === 0 ? 12 : horaNum;
    return `${hora12}:${minutos} ${periodo}`;
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get numersPagina(): number[] {
    const numeros = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    
    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }
    return numeros;
  }

  // Navegación a nueva cita
  irANuevaCita() {
    this.router.navigate(['/citas']);
  }
}
