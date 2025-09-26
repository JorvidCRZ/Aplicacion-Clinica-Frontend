import { Component, OnInit } from '@angular/core';
import { MiMascota, MiMascotaCardComponent } from '../../../../../shared/components/index-dashboard-user';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MascotaUsuario {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  foto: string;
  fechaRegistro: string;
  proximaCita: string;
  estado: 'saludable' | 'tratamiento' | 'vacunacion';
}

@Component({
  selector: 'app-mis-mascotas',
  standalone: true,
  imports: [CommonModule, RouterModule, MiMascotaCardComponent],
  templateUrl: './mis-mascotas.component.html',
  styleUrl: './mis-mascotas.component.css'
})
export class MisMascotasComponent implements OnInit{
  mascotas: MascotaUsuario[] = [
    {
      id: '1',
      nombre: 'Luna',
      especie: 'Perro',
      raza: 'Golden Retriever',
      edad: 3,
      foto: 'assets/dueños/ama-perro.webp',
      fechaRegistro: '2024-01-15',
      proximaCita: '2025-09-05',
      estado: 'saludable'
    },
    {
      id: '2',
      nombre: 'Mimi',
      especie: 'Gato',
      raza: 'Persa',
      edad: 2,
      foto: 'assets/dueños/amo-gato.webp',
      fechaRegistro: '2024-06-20',
      proximaCita: '2025-09-10',
      estado: 'vacunacion'
    }
  ];

  ngOnInit(): void {
    // Aquí podrías cargar las mascotas del usuario desde un servicio
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'saludable': return 'bg-success';
      case 'tratamiento': return 'bg-warning';
      case 'vacunacion': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'saludable': return 'Saludable';
      case 'tratamiento': return 'En Tratamiento';
      case 'vacunacion': return 'Vacunación Pendiente';
      default: return estado;
    }
  }

  agendarCita(mascota: MascotaUsuario | MiMascota): void {
    // Redirigir a agendar cita para esta mascota específica
    console.log('Agendar cita para:', mascota.nombre);
  }

  editarMascota(mascota: MiMascota): void {
    // Lógica para editar mascota
    console.log('Editar mascota:', mascota.nombre);
  }

  transformMascota(mascota: MascotaUsuario): MiMascota {
    return {
      id: mascota.id,
      nombre: mascota.nombre,
      raza: mascota.raza,
      edad: mascota.edad,
      foto: mascota.foto,
      estado: mascota.estado,
      fechaRegistro: new Date(mascota.fechaRegistro),
      proximaCita: mascota.proximaCita ? new Date(mascota.proximaCita) : undefined
    };
  }
}
