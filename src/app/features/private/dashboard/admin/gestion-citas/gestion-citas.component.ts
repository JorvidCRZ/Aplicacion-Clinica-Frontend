import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { CitaCompleta, EstadoCita } from '../../../../../core/models/common/cita';

@Component({
  selector: 'app-gestion-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './gestion-citas.component.html',
  styleUrl: './gestion-citas.component.css'
})
export class GestionCitasComponent implements OnInit {
  citas: CitaCompleta[] = [];
  isLoading = false;

  // 📊 Estados de citas disponibles
  estadosCitas: EstadoCita[] = [
    { id: 'pendiente', label: 'Pendiente', color: '#ff9800', icon: 'fa-clock' },
    { id: 'confirmada', label: 'Confirmada', color: '#2196f3', icon: 'fa-check-circle' },
    { id: 'completada', label: 'Completada', color: '#4caf50', icon: 'fa-check-double' },
    { id: 'cancelada', label: 'Cancelada', color: '#f44336', icon: 'fa-times-circle' }
  ];

  // 📋 Configuración de columnas para la tabla
  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'pacienteNombre', label: 'Paciente', sortable: true },
    { key: 'doctorNombre', label: 'Doctor', sortable: true },
    { key: 'especialidad', label: 'Especialidad', sortable: true },
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'hora', label: 'Hora', sortable: true },
    { key: 'tipoConsulta', label: 'Tipo Consulta', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true }
  ];

  // 🎯 Configuración de acciones para cada fila
  actions: TableAction[] = [
    {
      action: 'view',
      label: 'Ver',
      icon: 'fa-eye',
      class: 'btn-view'
    },
    {
      action: 'edit',
      label: 'Editar',
      icon: 'fa-edit',
      class: 'btn-edit'
    },
    {
      action: 'confirm',
      label: 'Confirmar',
      icon: 'fa-check',
      class: 'btn-success'
    },
    {
      action: 'cancel',
      label: 'Cancelar',
      icon: 'fa-times',
      class: 'btn-danger'
    }
  ];

  ngOnInit(): void {
    this.cargarCitas();
  }

  // 📅 Cargar datos de citas desde localStorage
  cargarCitas(): void {
    this.isLoading = true;
    
    // Simular delay de carga
    setTimeout(() => {
      this.citas = this.obtenerCitas();
      
      // Agregar citas de ejemplo si no existen
      if (this.citas.length === 0) {
        this.agregarCitasEjemplo();
      }
      
      this.isLoading = false;
    }, 500);
  }

  // 📋 Agregar citas de ejemplo
  private agregarCitasEjemplo(): void {
    const citasEjemplo: CitaCompleta[] = [
      {
        id: 1,
        pacienteNombre: 'Ana María Rodríguez',
        doctorNombre: 'Dr. Luján Carrión',
        especialidad: 'Cardiología',
        fecha: '2025-01-15',
        hora: '10:00',
        estado: 'confirmada',
        pacienteEmail: 'ana.rodriguez@email.com',
        pacienteTelefono: '987654321',
        pacienteEdad: 34,
        tipoConsulta: 'Consulta Especializada',
        motivoConsulta: 'Revisión cardiovascular de rutina',
        sintomas: 'Dolor en el pecho ocasional, fatiga',
        notasAdicionales: 'Paciente con antecedentes familiares de cardiopatía',
        fechaCreacion: '2025-01-10T10:00:00Z',
        duracionEstimada: 45
      },
      {
        id: 2,
        pacienteNombre: 'Carlos Eduardo Mendoza',
        doctorNombre: 'Dra. María González',
        especialidad: 'Dermatología',
        fecha: '2025-01-16',
        hora: '14:30',
        estado: 'pendiente',
        pacienteEmail: 'carlos.mendoza@email.com',
        pacienteTelefono: '956789123',
        pacienteEdad: 39,
        tipoConsulta: 'Primera Consulta',
        motivoConsulta: 'Evaluación de lesiones en la piel',
        sintomas: 'Manchas rojas en brazos y piernas',
        notasAdicionales: 'Posible reacción alérgica',
        fechaCreacion: '2025-01-11T15:30:00Z',
        duracionEstimada: 30
      },
      {
        id: 3,
        pacienteNombre: 'Sofía Elena Torres',
        doctorNombre: 'Dr. Carlos Mendoza',
        especialidad: 'Medicina General',
        fecha: '2025-01-20',
        hora: '09:15',
        estado: 'completada',
        pacienteEmail: 'sofia.torres@email.com',
        pacienteTelefono: '912345678',
        pacienteEdad: 32,
        tipoConsulta: 'Consulta de Control',
        motivoConsulta: 'Chequeo médico general anual',
        sintomas: 'Ninguno específico - revisión preventiva',
        notasAdicionales: 'Paciente en buen estado de salud general',
        fechaCreacion: '2025-01-05T08:00:00Z',
        duracionEstimada: 30
      },
      {
        id: 4,
        pacienteNombre: 'Miguel Ángel Herrera',
        doctorNombre: 'Dr. Luján Carrión',
        especialidad: 'Cardiología',
        fecha: '2025-01-22',
        hora: '11:00',
        estado: 'pendiente',
        pacienteEmail: 'miguel.herrera@email.com',
        pacienteTelefono: '923456789',
        pacienteEdad: 55,
        tipoConsulta: 'Consulta de Seguimiento',
        motivoConsulta: 'Control post-operatorio',
        sintomas: 'Recuperación de cirugía cardíaca',
        notasAdicionales: 'Seguimiento post-bypass coronario',
        fechaCreacion: '2025-01-12T09:00:00Z',
        duracionEstimada: 60
      }
    ];
    
    localStorage.setItem('citas', JSON.stringify(citasEjemplo));
    this.citas = citasEjemplo;
  }

  // 📂 Obtener citas desde localStorage
  private obtenerCitas(): CitaCompleta[] {
    const citasStr = localStorage.getItem('citas');
    return citasStr ? JSON.parse(citasStr) : [];
  }

  // ➕ Agregar nueva cita
  agregarCita(): void {
    console.log('➕ Agregar nueva cita');
    // TODO: Implementar modal o navegación a formulario
    alert('Función de agregar cita próximamente disponible');
  }

  // 🎯 Manejar acciones de la tabla
  onTableAction(event: { action: string, item: any }): void {
    const cita = event.item as CitaCompleta;
    
    switch (event.action) {
      case 'view':
        this.verCita(cita);
        break;
      case 'edit':
        this.editarCita(cita);
        break;
      case 'confirm':
        this.confirmarCita(cita);
        break;
      case 'cancel':
        this.cancelarCita(cita);
        break;
      default:
        console.log('Acción no reconocida:', event.action);
    }
  }

  // 👁️ Ver detalles de la cita
  private verCita(cita: CitaCompleta): void {
    console.log('👁️ Ver cita:', cita);
    const detalles = `
Cita ID: ${cita.id}
Paciente: ${cita.pacienteNombre} (${cita.pacienteEdad} años)
Doctor: ${cita.doctorNombre}
Especialidad: ${cita.especialidad}
Fecha: ${cita.fecha} a las ${cita.hora}
Estado: ${cita.estado}
Tipo de Consulta: ${cita.tipoConsulta}
Motivo: ${cita.motivoConsulta}
Síntomas: ${cita.sintomas || 'No especificados'}
Duración: ${cita.duracionEstimada || 30} minutos
    `;
    alert(detalles);
  }

  // ✏️ Editar cita
  private editarCita(cita: CitaCompleta): void {
    console.log('✏️ Editar cita:', cita);
    // TODO: Implementar modal o navegación a formulario de edición
    alert('Función de editar cita próximamente disponible');
  }

  // ✅ Confirmar cita
  private confirmarCita(cita: CitaCompleta): void {
    if (cita.estado === 'confirmada') {
      alert('La cita ya está confirmada');
      return;
    }
    
    this.actualizarEstadoCita(cita.id, 'confirmada');
    console.log('✅ Cita confirmada:', cita.id);
  }

  // ❌ Cancelar cita
  private cancelarCita(cita: CitaCompleta): void {
    const confirmacion = confirm(`¿Estás seguro de cancelar la cita de ${cita.pacienteNombre}?`);
    
    if (confirmacion) {
      this.actualizarEstadoCita(cita.id, 'cancelada');
      console.log('❌ Cita cancelada:', cita.id);
    }
  }

  // 🔄 Actualizar estado de cita
  private actualizarEstadoCita(citaId: number, nuevoEstado: CitaCompleta['estado']): void {
    const citas = this.obtenerCitas();
    const citaIndex = citas.findIndex(c => c.id === citaId);
    
    if (citaIndex !== -1) {
      citas[citaIndex].estado = nuevoEstado;
      citas[citaIndex].fechaModificacion = new Date().toISOString();
      
      localStorage.setItem('citas', JSON.stringify(citas));
      this.cargarCitas();
    }
  }

  // 🔄 Manejar cambios de ordenamiento
  onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
    console.log('🔄 Ordenar por:', event.column, event.direction);
    // El DataTableComponent maneja el ordenamiento internamente
  }
}
