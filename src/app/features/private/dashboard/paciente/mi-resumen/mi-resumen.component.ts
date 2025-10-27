import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, AuthState } from '../../../../../core/services/rol/auth.service';
import { Paciente } from '../../../../../core/models/users/paciente';

interface Cita {
  id: number;
  fecha: Date;
  doctor: string;
  especialidad: string;
}

@Component({
  selector: 'app-mi-resumen',
  imports: [CommonModule],
  templateUrl: './mi-resumen.component.html',
  styleUrl: './mi-resumen.component.css'
})
export class MiResumenComponent implements OnInit, OnDestroy {
  
  // Usuario actual del sistema
  currentUser: Paciente | null = null;
  private authSubscription?: Subscription;
  
  // Datos de citas
  proximaCita: Cita | null = null;
  totalCitas: number = 0;
  saldoPendiente: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación para obtener datos reales
    this.authSubscription = this.authService.authState$.subscribe((authState: AuthState) => {
      if (authState.isLoggedIn && authState.user) {
        this.currentUser = authState.user as Paciente;
        this.cargarDatosPaciente();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private cargarDatosPaciente(): void {
    if (!this.currentUser) return;

    // Aquí cargarías los datos reales desde una API
    // Por ahora simulamos con datos básicos
    this.totalCitas = 5;
    this.saldoPendiente = 150.00;
    
    // Simular próxima cita (en el futuro esto vendría de una API)
    this.proximaCita = {
      id: 1,
      fecha: new Date('2024-12-15'),
      doctor: 'María González',
      especialidad: 'Cardiología'
    };

    console.log('Datos del paciente logueado:', this.currentUser);
  }

  // Métodos de navegación
  agendarCita(): void {
    this.router.navigate(['/citas']);
  }

  verHistorial(): void {
    this.router.navigate(['/paciente/historial-medico']);
  }

  verPagos(): void {
    this.router.navigate(['/paciente/pagos']);
  }

  editarPerfil(): void {
    this.router.navigate(['/paciente/mi-perfil']);
  }

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
