import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MiCita {
  id: string;
  nombreMascota: string;
  servicioRequerido: string;
  fechaPreferida: Date;
  horaPreferida: string;
  veterinario: string;
  estado: string;
  observaciones?: string;
}
@Component({
  selector: 'app-mi-cita-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-cita-card.component.html',
  styleUrl: './mi-cita-card.component.css'
})
export class MiCitaCardComponent {
  @Input() cita!: MiCita;
  @Input() tipo: 'proxima' | 'historial' = 'proxima';
  @Output() verDetalles = new EventEmitter<MiCita>();
  @Output() cancelar = new EventEmitter<MiCita>();

  getTipoClass(): string {
    return this.tipo === 'proxima' ? 'proxima' : 'historial';
  }

  getEstadoClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'confirmada':
        return 'bg-success';
      case 'pendiente':
        return 'bg-warning';
      case 'cancelada':
        return 'bg-danger';
      case 'completada':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelada':
        return 'Cancelada';
      case 'completada':
        return 'Completada';
      default:
        return estado;
    }
  }

  onVerDetalles(): void {
    this.verDetalles.emit(this.cita);
  }

  onCancelar(): void {
    this.cancelar.emit(this.cita);
  }
}
