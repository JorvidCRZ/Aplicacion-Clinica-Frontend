import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MiMascota {
  id: string;
  nombre: string;
  raza: string;
  edad: number;
  foto: string;
  estado: string;
  fechaRegistro: Date;
  proximaCita?: Date;
}

@Component({
  selector: 'app-mi-mascota-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-mascota-card.component.html',
  styleUrl: './mi-mascota-card.component.css'
})
export class MiMascotaCardComponent {
  @Input() mascota!: MiMascota;
  @Output() agendarCita = new EventEmitter<MiMascota>();
  @Output() editar = new EventEmitter<MiMascota>();

  getEstadoClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'bg-success';
      case 'inactivo':
        return 'bg-secondary';
      case 'tratamiento':
        return 'bg-warning';
      default:
        return 'bg-primary';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'Activo';
      case 'inactivo':
        return 'Inactivo';
      case 'tratamiento':
        return 'En Tratamiento';
      default:
        return estado;
    }
  }

  onAgendarCita(): void {
    this.agendarCita.emit(this.mascota);
  }

  onEditar(): void {
    this.editar.emit(this.mascota);
  }
}
