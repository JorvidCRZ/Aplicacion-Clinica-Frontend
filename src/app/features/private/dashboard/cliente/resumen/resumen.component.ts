import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { Usuario } from '../../../../../core/models/users/usuario';
import { ActividadReciente, DashboardStats } from '../../../../../core/models/utils/dashboard';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resumen.component.html',
  styleUrl: './resumen.component.css'
})
export class ResumenComponent implements OnInit {
  currentUser: Usuario | null = null;
  userName: string = '';
  
  stats: DashboardStats = {
    mascotas: 2,
    adopciones: 1,
    pedidos: 3,
    citas: 1
  };

  recentActivities: ActividadReciente[] = [
    {
      id: '1',
      titulo: 'Cita veterinaria programada',
      descripcion: 'Cita de control para Luna el 5 de septiembre',
      fecha: 'Hace 2 horas',
      tipo: 'cita',
      estado: 'pendiente'
    },
    {
      id: '2',
      titulo: 'Solicitud de adopción enviada',
      descripcion: 'Solicitud para adoptar a Max (Pastor Alemán)',
      fecha: 'Hace 1 día',
      tipo: 'adopcion',
      estado: 'pendiente'
    },
    {
      id: '3',
      titulo: 'Pedido entregado',
      descripcion: 'Alimento premium para perros - Pedido #1023',
      fecha: 'Hace 3 días',
      tipo: 'pedido',
      estado: 'completado'
    }
  ];

  proximasCitas = [
    {
      id: '1',
      servicio: 'Consulta General',
      doctor: 'Dr. María González',
      fecha: '1 de Febrero, 2024 - 10:00 AM'
    },
    {
      id: '2',
      servicio: 'Vacunación',
      doctor: 'Dr. Carlos Mendoza',
      fecha: '5 de Febrero, 2024 - 2:30 PM'
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.userName = user?.nombre || 'Usuario';
    });
  }

  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'pendiente': 'Pendiente',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  }
}

