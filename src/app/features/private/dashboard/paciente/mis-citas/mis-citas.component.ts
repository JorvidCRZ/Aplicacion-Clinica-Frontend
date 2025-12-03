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

  // Estados de carga
  cargandoCitas = false;
  errorCitas: string | null = null;

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
    this.cargandoCitas = true;
    this.errorCitas = null;
    
    const usuario = this.pacienteActual;
    if (!usuario?.idUsuario) {
      this.errorCitas = 'No se pudo identificar al usuario';
      this.cargandoCitas = false;
      return;
    }

    // Intentar cargar desde el backend primero
    this.cargarCitasDesdeBackend(usuario.idUsuario);
  }

  private cargarCitasDesdeBackend(idUsuario: number) {
    // Primero intentar con el endpoint específico por paciente
    this.citaService.obtenerCitasPorPaciente(idUsuario).subscribe({
      next: (citasPaciente) => {
        console.log('✅ Citas del paciente cargadas desde backend:', citasPaciente);
        
        // Mapear citas del backend al formato del componente
        this.citas = this.mapearCitasBackend(citasPaciente);
        
        // Mezclar con citas de localStorage como respaldo
        this.agregarCitasLocalStorage();
        
        this.finalizarCargaCitas();
      },
      error: (error) => {
        console.error('❌ Endpoint específico no disponible, probando endpoint general:', error);
        
        // Fallback: usar endpoint general y filtrar
        this.cargarDesdeEndpointGeneral();
      }
    });
  }

  private cargarDesdeEndpointGeneral() {
    this.citaService.listarTodasLasCitas().subscribe({
      next: (todasLasCitas) => {
        console.log('✅ Todas las citas cargadas, filtrando por usuario...');
        
        // TODO: Filtrar por paciente cuando tengas la lógica de identificación
        // Por ahora mostrar todas como ejemplo
        const citasFiltradas = todasLasCitas; // Aquí deberías filtrar por idPaciente
        
        // Mapear citas del backend al formato del componente
        this.citas = this.mapearCitasBackend(citasFiltradas);
        
        // Mezclar con citas de localStorage como respaldo
        this.agregarCitasLocalStorage();
        
        this.finalizarCargaCitas();
      },
      error: (error) => {
        console.error('❌ Error cargando desde endpoint general:', error);
        console.log('🔄 Fallback: cargando desde localStorage...');
        
        // Fallback final: cargar solo desde localStorage
        this.cargarSoloDesdeLocalStorage();
      }
    });
  }

  private mapearCitasBackend(citasBackend: any[]): Cita[] {
    return citasBackend.map(cita => ({
      id: cita.idCita,
      fecha: cita.fecha, // Ya viene como string (LocalDate serializado)
      hora: cita.hora,   // Ya viene como string (LocalTime serializado)
      doctor: {
        nombre: this.extraerPrimerNombre(cita.medicoNombre),
        apellido: this.extraerApellidos(cita.medicoNombre),
        especialidad: cita.especialidad,
        avatar: this.obtenerAvatarPorEspecialidad(cita.especialidad)
      },
      tipo: cita.subEspecialidad || 'Consulta General',
      motivo: 'Consulta médica', // El backend no devuelve motivo en este DTO
      estado: this.mapearEstadoCita(cita.estado),
      precio: cita.precio,
      consultorio: 'Por asignar', // El backend no devuelve consultorio en este DTO
      duracion: 30, // Valor por defecto
      puedeReagendar: this.puedeReagendar(cita.estado, cita.fecha),
      puedeCancelar: this.puedeCancelar(cita.estado, cita.fecha)
    }));
  }

  private agregarCitasLocalStorage() {
    const correo = this.pacienteActual?.correo;
    if (!correo) return;
    
    const todas: CitaCompleta[] = this.citaService.obtenerCitas();
    const mias = todas.filter(c => (c.pacienteEmail || '').toLowerCase() === correo.toLowerCase());
    
    const citasLocal: Cita[] = mias.map(c => ({
      id: c.id + 10000, // Offset para evitar conflictos con IDs del backend
      fecha: c.fecha,
      hora: c.hora,
      doctor: {
        nombre: this.extraerPrimerNombre(c.doctorNombre),
        apellido: this.extraerApellidos(c.doctorNombre),
        especialidad: c.especialidad,
        avatar: this.obtenerAvatarPorEspecialidad(c.especialidad)
      },
      tipo: c.tipoConsulta,
      motivo: c.motivoConsulta,
      estado: this.mapearEstadoCita(c.estado),
      precio: (c as any).precio ?? this.obtenerPrecioPorEspecialidad(c.especialidad),
      consultorio: 'Por asignar',
      duracion: c.duracionEstimada || 30,
      puedeReagendar: this.puedeReagendar(c.estado, c.fecha),
      puedeCancelar: this.puedeCancelar(c.estado, c.fecha)
    }));

    // Agregar citas locales que no estén ya en el backend
    const idsBackend = new Set(this.citas.map(c => c.id));
    const citasNuevas = citasLocal.filter(c => !idsBackend.has(c.id - 10000));
    
    this.citas.push(...citasNuevas);
  }

  private cargarSoloDesdeLocalStorage() {
    this.citas = [];
    this.agregarCitasLocalStorage();
    this.finalizarCargaCitas();
  }

  private finalizarCargaCitas() {
    this.calcularEstadisticas();
    this.separarCitas();
    this.aplicarFiltros();
    this.cargandoCitas = false;
  }

  // Métodos auxiliares para mapeo
  private extraerPrimerNombre(nombreCompleto: string): string {
    return nombreCompleto.split(' ')[0] || nombreCompleto;
  }

  private extraerApellidos(nombreCompleto: string): string {
    const partes = nombreCompleto.split(' ');
    return partes.length > 1 ? partes.slice(1).join(' ') : '';
  }

  private mapearEstadoCita(estadoBackend: string): 'programada' | 'completada' | 'cancelada' | 'no-show' {
    const mapeo: Record<string, any> = {
      'confirmada': 'programada',
      'pendiente': 'programada',
      'completada': 'completada',
      'cancelada': 'cancelada',
      'no-show': 'no-show'
    };
    return mapeo[estadoBackend.toLowerCase()] || 'programada';
  }

  private obtenerAvatarPorEspecialidad(especialidad: string): string {
    const avatares: Record<string, string> = {
      'Cardiología': 'assets/doctores/cardiologo.webp',
      'Dermatología': 'assets/doctores/dermatologo.webp',
      'Pediatría': 'assets/doctores/pediatra.webp',
      'Ginecología': 'assets/doctores/ginecologo.webp',
      'Medicina General': 'assets/doctores/general.webp',
      'Traumatología': 'assets/doctores/traumatologo.webp',
      'Psicología': 'assets/doctores/psicologo.webp',
      'Odontología': 'assets/doctores/odontologo.webp'
    };
    return avatares[especialidad] || 'assets/doctores/general.webp';
  }

  private puedeReagendar(estado: string, fecha: string): boolean {
    const estadosReagendables = ['confirmada', 'pendiente'];
    const fechaCita = new Date(fecha);
    const hoy = new Date();
    
    return estadosReagendables.includes(estado.toLowerCase()) && fechaCita > hoy;
  }

  private puedeCancelar(estado: string, fecha: string): boolean {
    const estadosCancelables = ['confirmada', 'pendiente'];
    const fechaCita = new Date(fecha);
    const hoy = new Date();
    
    // Puede cancelar si falta más de 24 horas
    const diferenciaMilisegundos = fechaCita.getTime() - hoy.getTime();
    const diferenciaHoras = diferenciaMilisegundos / (1000 * 60 * 60);
    
    return estadosCancelables.includes(estado.toLowerCase()) && diferenciaHoras > 24;
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
      
      // Si la cita viene del backend (ID < 10000), intentar cancelar en el backend
      if (cita.id < 10000) {
        this.citaService.actualizarEstadoCita(cita.id, 'cancelada').subscribe({
          next: () => {
            console.log('✅ Cita cancelada en backend');
            this.actualizarCitaLocal(cita.id, 'cancelada');
            alert('Cita cancelada exitosamente');
          },
          error: (error) => {
            console.error('❌ Error cancelando en backend:', error);
            // Fallback: actualizar solo localmente
            this.actualizarCitaLocal(cita.id, 'cancelada');
            alert('Cita cancelada localmente (error de conexión)');
          }
        });
      } else {
        // Cita local: actualizar solo en localStorage
        this.actualizarCitaLocal(cita.id, 'cancelada');
        alert('Cita cancelada exitosamente');
      }
    }
  }

  private actualizarCitaLocal(idCita: number, nuevoEstado: 'cancelada' | 'completada') {
    // Actualizar en la lista local
    const cita = this.citas.find(c => c.id === idCita);
    if (cita) {
      cita.estado = nuevoEstado;
      cita.puedeCancelar = false;
      cita.puedeReagendar = false;
    }
    
    // Si es una cita de localStorage (ID >= 10000), actualizarla también ahí
    if (idCita >= 10000) {
      const idReal = idCita - 10000;
      const citasStorage = this.citaService.obtenerCitas();
      const citaStorage = citasStorage.find(c => c.id === idReal);
      if (citaStorage) {
        citaStorage.estado = nuevoEstado as any;
        this.citaService.guardarCita(citaStorage);
      }
    }
    
    this.calcularEstadisticas();
    this.separarCitas();
    this.aplicarFiltros();
  }

  // Método para recargar citas manualmente
  recargarCitas() {
    this.cargarCitas();
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
