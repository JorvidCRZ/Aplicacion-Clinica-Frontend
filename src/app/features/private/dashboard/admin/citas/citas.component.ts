import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Cita {
  id: string;
  nombreCliente: string;
  emailCliente: string;
  telefono: string;
  nombreMascota: string;
  servicioRequerido: string;
  fechaCita: Date;
  horaCita: string;
  veterinario: string;
  estado: string;
  observaciones?: string;
}

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './citas.component.html',
  styleUrl: './citas.component.css'
})
export class CitasComponent implements OnInit {
  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  searchTerm: string = '';
  filtroEstado: string = '';
  filtroFecha: string = '';
  mostrarModal: boolean = false;
  citaEditando: Cita | null = null;
  
  // Estados disponibles
  estados = [
    'Confirmada',
    'Pendiente',
    'Cancelada'
  ];

  // Servicios disponibles
  servicios = [
    'Consulta General',
    'Vacunación',
    'Desparasitación',
    'Cirugía',
    'Revisión Rutinaria',
    'Emergencia',
    'Radiografía',
    'Exámenes de Laboratorio'
  ];

  // Veterinarios disponibles
  veterinarios = [
    'Dr. García',
    'Dra. López',
    'Dr. Martínez',
    'Dra. Rodríguez',
    'Dr. Hernández'
  ];

  citaForm = {
    nombreCliente: '',
    emailCliente: '',
    telefono: '',
    nombreMascota: '',
    servicioRequerido: '',
    fechaCita: '',
    horaCita: '',
    veterinario: '',
    estado: 'Pendiente',
    observaciones: ''
  };

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    // Cargar citas del localStorage
    const citasStr = localStorage.getItem('citas');
    if (citasStr) {
      this.citas = JSON.parse(citasStr);
      // Convertir fechas de string a Date si es necesario
      this.citas.forEach(cita => {
        if (typeof cita.fechaCita === 'string') {
          cita.fechaCita = new Date(cita.fechaCita);
        }
      });
    } else {
      // Citas de ejemplo basadas en la imagen
      this.citas = [
        {
          id: 'CITA-001',
          nombreCliente: 'María García',
          emailCliente: 'maria@email.com',
          telefono: '+51 990 889 777',
          nombreMascota: 'Max',
          servicioRequerido: 'Consulta General',
          fechaCita: new Date('2024-01-25'),
          horaCita: '10:00',
          veterinario: 'Dr. García',
          estado: 'Confirmada',
          observaciones: 'Revisión rutinaria'
        },
        {
          id: 'CITA-002',
          nombreCliente: 'Carlos López',
          emailCliente: 'carlos@email.com', 
          telefono: '+51 987 695 332',
          nombreMascota: 'Luna',
          servicioRequerido: 'Vacunación',
          fechaCita: new Date('2024-01-15'),
          horaCita: '11:30',
          veterinario: 'Dra. López',
          estado: 'Pendiente',
          observaciones: 'Primera dosis de vacuna'
        },
        {
          id: 'CITA-003',
          nombreCliente: 'Ana Martínez',
          emailCliente: 'ana@email.com',
          telefono: '+51 922 655 887',
          nombreMascota: 'Buddy',
          servicioRequerido: 'Cirugía',
          fechaCita: new Date('2024-01-16'),
          horaCita: '09:00',
          veterinario: 'Dr. Martínez',
          estado: 'Confirmada',
          observaciones: 'Esterilización programada'
        }
      ];
    }
    this.citasFiltradas = [...this.citas];
  }

  filtrarCitas(): void {
    let citasFiltradas = this.citas;
    
    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      citasFiltradas = citasFiltradas.filter(cita =>
        cita.nombreCliente.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cita.nombreMascota.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cita.emailCliente.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cita.servicioRequerido.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por estado
    if (this.filtroEstado) {
      citasFiltradas = citasFiltradas.filter(cita =>
        cita.estado === this.filtroEstado
      );
    }
    
    // Filtrar por fecha
    if (this.filtroFecha) {
      const fechaFiltro = new Date(this.filtroFecha);
      citasFiltradas = citasFiltradas.filter(cita => {
        const fechaCita = new Date(cita.fechaCita);
        return fechaCita.toDateString() === fechaFiltro.toDateString();
      });
    }
    
    this.citasFiltradas = citasFiltradas;
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = '';
    this.filtroFecha = '';
    this.citasFiltradas = [...this.citas];
  }

  abrirModalNuevo(): void {
    this.citaEditando = null;
    this.citaForm = {
      nombreCliente: '',
      emailCliente: '',
      telefono: '',
      nombreMascota: '',
      servicioRequerido: '',
      fechaCita: '',
      horaCita: '',
      veterinario: '',
      estado: 'Pendiente',
      observaciones: ''
    };
    this.mostrarModal = true;
  }

  editarCita(cita: Cita): void {
    this.citaEditando = cita;
    this.citaForm = {
      nombreCliente: cita.nombreCliente,
      emailCliente: cita.emailCliente,
      telefono: cita.telefono,
      nombreMascota: cita.nombreMascota,
      servicioRequerido: cita.servicioRequerido,
      fechaCita: this.formatearFechaInput(cita.fechaCita),
      horaCita: cita.horaCita,
      veterinario: cita.veterinario,
      estado: cita.estado,
      observaciones: cita.observaciones || ''
    };
    this.mostrarModal = true;
  }

  cambiarEstado(cita: Cita, nuevoEstado: string): void {
    const index = this.citas.findIndex(c => c.id === cita.id);
    if (index !== -1) {
      this.citas[index].estado = nuevoEstado;
      this.guardarEnLocalStorage();
      this.filtrarCitas();
    }
  }

  confirmarCita(cita: Cita): void {
    this.cambiarEstado(cita, 'Confirmada');
  }

  cancelarCita(cita: Cita): void {
    if (confirm(`¿Estás seguro de cancelar la cita de ${cita.nombreMascota}?`)) {
      this.cambiarEstado(cita, 'Cancelada');
    }
  }

  eliminarCita(cita: Cita): void {
    if (confirm(`¿Estás seguro de eliminar la cita de ${cita.nombreMascota}?`)) {
      this.citas = this.citas.filter(c => c.id !== cita.id);
      this.filtrarCitas();
      this.guardarEnLocalStorage();
    }
  }

  guardarCita(): void {
    if (this.citaEditando) {
      // Actualizar cita existente
      const index = this.citas.findIndex(c => c.id === this.citaEditando!.id);
      if (index !== -1) {
        this.citas[index] = {
          id: this.citas[index].id,
          nombreCliente: this.citaForm.nombreCliente,
          emailCliente: this.citaForm.emailCliente,
          telefono: this.citaForm.telefono,
          nombreMascota: this.citaForm.nombreMascota,
          servicioRequerido: this.citaForm.servicioRequerido,
          fechaCita: new Date(this.citaForm.fechaCita),
          horaCita: this.citaForm.horaCita,
          veterinario: this.citaForm.veterinario,
          estado: this.citaForm.estado,
          observaciones: this.citaForm.observaciones
        };
      }
    } else {
      // Crear nueva cita
      const nuevaCita: Cita = {
        id: this.generarNuevoId(),
        nombreCliente: this.citaForm.nombreCliente,
        emailCliente: this.citaForm.emailCliente,
        telefono: this.citaForm.telefono,
        nombreMascota: this.citaForm.nombreMascota,
        servicioRequerido: this.citaForm.servicioRequerido,
        fechaCita: new Date(this.citaForm.fechaCita),
        horaCita: this.citaForm.horaCita,
        veterinario: this.citaForm.veterinario,
        estado: this.citaForm.estado,
        observaciones: this.citaForm.observaciones
      };
      this.citas.push(nuevaCita);
    }
    
    this.filtrarCitas();
    this.guardarEnLocalStorage();
    this.cerrarModal();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.citaEditando = null;
  }

  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearFechaInput(fecha: Date): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'Confirmada':
        return 'estado-confirmada';
      case 'Pendiente':
        return 'estado-pendiente';
      case 'Cancelada':
        return 'estado-cancelada';
      default:
        return 'estado-pendiente';
    }
  }

  generarNuevoId(): string {
    return 'CITA-' + Date.now().toString().slice(-6);
  }

  private guardarEnLocalStorage(): void {
    localStorage.setItem('citas', JSON.stringify(this.citas));
  }
}
