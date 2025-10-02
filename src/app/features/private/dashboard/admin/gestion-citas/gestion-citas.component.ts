import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { CitaCompleta, EstadoCita } from '../../../../../core/models/common/cita';
import { CitaService } from '../../../../../core/services/cita.service';

@Component({
  selector: 'app-gestion-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './gestion-citas.component.html',
  styleUrl: './gestion-citas.component.css'
})
export class GestionCitasComponent implements OnInit {
  guardarCita(): void {
    if (!this.citaActual) return;
    this.citaService.guardarCita(this.citaActual);
    this.citas = this.citaService.obtenerCitas();
    this.citaActual = null;
    this.mostrarModalVer = false;
    this.modoEdicion = false;
  }

  cancelarFormulario(): void {
    this.citaActual = null;
    this.mostrarModalVer = false;
    this.modoEdicion = false;
  }
  eliminarCita(id: number): void {
    this.citaService.eliminarCita(id);
    this.citas = this.citaService.obtenerCitas();
  }
  mostrarModalVer = false;
  citaActual: CitaCompleta | null = null;
  modoEdicion = false;
  citaService = new CitaService();
  citas: CitaCompleta[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.citas = this.citaService.obtenerCitas();
  }


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
      icon: 'fa fa-eye',
      class: 'btn-view'
    },
    {
      action: 'edit',
      label: 'Editar',
      icon: 'fa fa-edit',
      class: 'btn-edit'
    },
    {
      action: 'confirm',
      label: 'Confirmar',
      icon: 'fa fa-check',
      class: 'btn-success'
    },
    {
      action: 'cancel',
      label: 'Cancelar',
      icon: 'fa fa-times',
      class: 'btn-danger'
    }
  ];

  // Solo una implementación de ngOnInit

  // 📂 Obtener citas desde localStorage
  private obtenerCitas(): CitaCompleta[] {
    const citasStr = localStorage.getItem('citas');
    return citasStr ? JSON.parse(citasStr) : [];
  }

  // ➕ Agregar nueva cita
  agregarCita(): void {
    this.modoEdicion = false;
    this.citaActual = {
      id: 0,
      pacienteNombre: '',
      doctorNombre: '',
      especialidad: '',
      fecha: '',
      hora: '',
      estado: 'pendiente',
      pacienteEmail: '',
      pacienteTelefono: '',
      tipoConsulta: '',
      motivoConsulta: '',
      fechaCreacion: new Date().toISOString(),
    };
  }

  // 🎯 Manejar acciones de la tabla
  onTableAction(event: { action: string, item: any }): void {
    const cita = event.item as CitaCompleta;
    switch (event.action) {
      case 'view':
        this.mostrarModalVer = true;
        this.citaActual = { ...cita };
        break;
      case 'edit':
        this.modoEdicion = true;
        this.citaActual = { ...cita };
        break;
      case 'delete':
        this.eliminarCita(cita.id);
        break;
      default:
        console.log('Acción no reconocida:', event.action);
    }
  }


  // 🔄 Manejar cambios de ordenamiento
  onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
    console.log('🔄 Ordenar por:', event.column, event.direction);
    // El DataTableComponent maneja el ordenamiento internamente
  }
}
