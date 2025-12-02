import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudHorarioService } from '../../../../../core/services/logic/solicitud-horario.service';
import { SolicitudHorarioResponse } from '../../../../../core/models/common/solicitud-horario';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes.html',
  styleUrls: ['./solicitudes.css']
})
export class SolicitudesComponent implements OnInit {
  private solicitudService = inject(SolicitudHorarioService);

  solicitudes: SolicitudHorarioResponse[] = [];
  loading = false;

  ngOnInit() {
    this.cargarPendientes();
  }

  cargarPendientes() {
    this.loading = true;
    this.solicitudService.obtenerPendientes().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando solicitudes', err);
        this.loading = false;
      }
    });
  }

  procesarSolicitud(id: number, aprobar: boolean) {
    const accion = aprobar ? 'aprobar' : 'rechazar';
    if (!confirm(`¿Estás seguro de ${accion} esta solicitud?`)) return;

    const comentario = prompt("Ingresa un comentario para el médico (opcional):") || '';

    this.solicitudService.aprobarSolicitud(id, { aprobar, comentarios: comentario }).subscribe({
      next: () => {
        alert(`Solicitud ${accion}da con éxito.`);
        this.cargarPendientes(); // Recargar la lista para que desaparezca
      },
      error: (err) => alert('Error al procesar la solicitud.')
    });
  }
}