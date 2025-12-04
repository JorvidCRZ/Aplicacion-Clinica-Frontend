import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, catchError, of } from 'rxjs';
import { AuthService, AuthState } from '../../../../../core/services/auth/auth.service';
import { Usuario } from '../../../../../core/models/users/usuario';
import { UserService } from '../../../../../core/services/auth/user.service';
import { PacienteService } from '../../../../../core/services/rol/paciente.service';
import { CitaService } from '../../../../../core/services/logic/cita.service';

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
        private pacienteService: PacienteService,
        private citaService: CitaService
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

        const idUsuario = this.currentUser.idUsuario || 0;

        // Cargar citas reales del backend
        this.citaService.obtenerCitasPorPaciente(idUsuario)
            .pipe(catchError(() => of([])))
            .subscribe((citas: any[]) => {
                // Contar citas completadas
                this.totalCitas = citas.filter(c => c.estado?.toLowerCase() === 'completada').length;
                
                // Contar pagos realizados (citas completadas con pago confirmado)
                this.pagosRealizados = citas.filter(c => 
                    c.estado?.toLowerCase() === 'completada' && c.precio > 0
                ).length;

                // Buscar próxima cita (confirmada o pendiente, fecha futura)
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0); // Resetear a medianoche para comparación de solo fecha
                
                const citasFuturas = citas
                    .filter(c => {
                        const estadosValidos = ['confirmada', 'pendiente', 'programada', 'agendada'];
                        const fechaCita = this.parsearFechaLocal(c.fecha);
                        fechaCita.setHours(0, 0, 0, 0);
                        return estadosValidos.includes(c.estado?.toLowerCase()) && fechaCita >= hoy;
                    })
                    .sort((a, b) => {
                        const fechaA = this.parsearFechaLocal(a.fecha);
                        const fechaB = this.parsearFechaLocal(b.fecha);
                        return fechaA.getTime() - fechaB.getTime();
                    });

                console.log('Citas futuras encontradas:', citasFuturas);

                if (citasFuturas.length > 0) {
                    const proximaCitaBackend = citasFuturas[0];
                    this.proximaCita = {
                        id: proximaCitaBackend.idCita,
                        fecha: this.parsearFechaLocal(proximaCitaBackend.fecha),
                        doctor: proximaCitaBackend.medicoNombre || 'Doctor Asignado',
                        especialidad: proximaCitaBackend.especialidad || 'Consulta General'
                    };
                    console.log('Próxima cita asignada:', this.proximaCita);
                } else {
                    this.proximaCita = null;
                    console.log('No se encontraron citas futuras');
                }
            });

        console.log('Datos del usuario logueado:', this.currentUser);
    }

    private parsearFechaLocal(fechaStr: string): Date {
        // Parsear "YYYY-MM-DD" en zona horaria local
        const [year, month, day] = fechaStr.split('-').map(Number);
        return new Date(year, month - 1, day);
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
