import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, catchError, of } from 'rxjs';
import { AuthService, AuthState } from '../../../../../core/services/auth/auth.service';
import { Usuario } from '../../../../../core/models/users/usuario';
import { UserService } from '../../../../../core/services/auth/user.service';
import { PacienteService } from '../../../../../core/services/rol/paciente.service';

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
    styleUrls: ['./mi-resumen.component.css']
})
export class MiResumenComponent implements OnInit, OnDestroy {
    // Usuario actual del sistema
    currentUser: Usuario | null = null;
    private authSubscription?: Subscription;

    // Datos de citas
    proximaCita: Cita | null = null;
    totalCitas: number = 0;
    saldoPendiente: number = 0; // mantenido por compatibilidad aunque no se usa en UI
    pagosRealizados: number = 0;

    // Datos visibles del usuario
    nombreMostrar: string = '';
    telefonoMostrar: string = '';
    correoMostrar: string = '';

    constructor(
        private router: Router,
        private authService: AuthService,
        private userService: UserService,
        private pacienteService: PacienteService
    ) { }

    ngOnInit(): void {
        // Suscribirse al estado de autenticación para obtener datos reales
        this.authSubscription = this.authService.authState$.subscribe((authState: AuthState) => {
            if (authState.isLoggedIn && authState.user) {
                this.currentUser = authState.user as Usuario;
                this.nombreMostrar = this.userService.getDisplayName();
                this.correoMostrar = this.userService.getCorreoUsuarioActual() || '';
                this.telefonoMostrar = this.currentUser.persona?.telefono || '';
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

    // Modo visual: valores simulados si backend no está listo
    this.totalCitas = 5;
    this.saldoPendiente = 0;
    this.pagosRealizados = 8;

        this.proximaCita = {
            id: 1,
            fecha: new Date('2024-12-15'),
            doctor: 'María González',
            especialidad: 'Cardiología'
        };

        // Intentar complementar con datos de Paciente si el endpoint está disponible
        const idUsuario = this.currentUser.idUsuario || 0;
        if (idUsuario) {
            this.pacienteService.getByUsuario(idUsuario)
                .pipe(catchError(() => of(null)))
                .subscribe((paciente) => {
                    if (paciente) {
                        // Aquí podrías ajustar totalCitas/saldo/proximaCita si tu API los provee
                    }
                });
        }

        console.log('Datos del usuario logueado:', this.currentUser);
    }

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
