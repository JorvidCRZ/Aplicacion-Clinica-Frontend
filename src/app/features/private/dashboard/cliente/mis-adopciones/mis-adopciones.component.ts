import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MiAdopcion, MiAdopcionCardComponent } from '../../../../../shared/components/mi-adopcion-card/mi-adopcion-card.component';
import { Adopcion } from '../../../../../core/models/utils/dashboard';


@Component({
  selector: 'app-mis-adopciones',
  standalone: true,
  imports: [CommonModule, RouterModule, MiAdopcionCardComponent],
  templateUrl: './mis-adopciones.component.html',
  styleUrl: './mis-adopciones.component.css'
})
export class MisAdopcionesComponent implements OnInit {
  adopciones: Adopcion[] = [
    {
      id: '1',
      nombreMascota: 'Max',
      imagenMascota: 'https://res.cloudinary.com/dcdw3ofx2/image/upload/v1756107444/pastor_aleman2_dvgj7n.jpg',
      fecha: '2025-08-20',
      estado: 'pendiente',
      mensaje: 'Tu solicitud está siendo revisada por nuestro equipo.'
    },
    {
      id: '2',
      nombreMascota: 'Bella',
      imagenMascota: 'https://res.cloudinary.com/dcdw3ofx2/image/upload/v1756107458/golden_retriever4_zmspzs.jpg',
      fecha: '2025-07-15',
      estado: 'aprobado',
      mensaje: '¡Felicidades! Tu solicitud ha sido aprobada. Puedes venir a recoger a Bella.'
    },
    {
      id: '3',
      nombreMascota: 'Rocky',
      imagenMascota: 'https://res.cloudinary.com/dcdw3ofx2/image/upload/v1756107436/buldog1_dpcjtc.jpg',
      fecha: '2025-06-10',
      estado: 'rechazado',
      mensaje: 'Lamentablemente, Rocky ya ha sido adoptado por otra familia.'
    }
  ];

  ngOnInit(): void {
    // Aquí podrías cargar las adopciones del usuario desde un servicio
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'aprobado': return 'bg-success';
      case 'pendiente': return 'bg-warning';
      case 'rechazado': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'aprobado': return 'Aprobado';
      case 'pendiente': return 'En Revisión';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'aprobado': return 'bi-check-circle-fill';
      case 'pendiente': return 'bi-clock-fill';
      case 'rechazado': return 'bi-x-circle-fill';
      default: return 'bi-question-circle-fill';
    }
  }

  cancelarSolicitud(adopcion: Adopcion): void {
    if (confirm(`¿Estás seguro de cancelar la solicitud de adopción de ${adopcion.nombreMascota}?`)) {
      // Aquí implementarías la lógica para cancelar la solicitud
      console.log('Cancelar solicitud:', adopcion.id);
    }
  }

  verDetallesAdopcion(adopcion: MiAdopcion): void {
    console.log('Ver detalles de adopción:', adopcion);
    // Implementar lógica para mostrar detalles de la adopción
  }

  cancelarSolicitudAdopcion(adopcion: MiAdopcion): void {
    if (confirm(`¿Estás seguro de cancelar la solicitud de adopción de ${adopcion.nombreMascota}?`)) {
      console.log('Cancelar solicitud:', adopcion.id);
      // Implementar lógica para cancelar la solicitud
    }
  }

  transformAdopcion(adopcion: Adopcion): MiAdopcion {
    return {
      id: adopcion.id,
      nombreMascota: adopcion.nombreMascota,
      raza: 'No especificada', // Esta info no está en el modelo original
      edad: 0, // Esta info no está en el modelo original
      foto: adopcion.imagenMascota,
      fechaSolicitud: new Date(adopcion.fecha),
      estado: adopcion.estado === 'aprobado' ? 'aprobada' : adopcion.estado,
      observaciones: adopcion.mensaje
    };
  }

}
