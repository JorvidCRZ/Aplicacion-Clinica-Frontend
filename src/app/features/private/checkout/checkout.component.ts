import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, AuthState } from '../../../core/services/auth/auth.service';
import { Usuario } from '../../../core/models/users/usuario';
import { CitaService } from '../../../core/services/logic/cita.service';
import { CitaCompleta } from '../../../core/models/common/cita';
import { PagosService } from '../../../core/services/logic/pagos.service';
import { SubespecialidadService, Subespecialidad } from '../../../core/services/pages/subespecialidad.service';
import { EspecialidadService, Especialidad } from '../../../core/services/pages/especialidad.service';
import { PacienteService } from '../../../core/services/rol/paciente.service';

interface CitaMedica {
    id: string;
    doctor: string;
    especialidad: string;
    subespecialidad?: string;
    fecha: string; // ISO yyyy-MM-dd
    hora: string;  // HH:mm
    precio: number;
    descripcion: string;
    duracion: string; // e.g., '30 minutos'
}

interface MetodoPago {
    id: 'tarjeta' | 'yape';
    nombre: string;
    icono: string;
    comision: number; // porcentaje en decimal
    disponible: boolean;
}

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
    checkoutForm: FormGroup;
    pagoExitoso: boolean | null = null;
    procesandoPago = false;

    // Datos de la cita
    citaSeleccionada: CitaMedica | null = null;
    usuarioActual: Usuario | null = null;
    authSubscription: Subscription | null = null;

    // Métodos de pago
    metodosPago: MetodoPago[] = [
        { id: 'tarjeta', nombre: 'Tarjeta de Crédito/Débito', icono: 'fas fa-credit-card', comision: 0.035, disponible: true },
        { id: 'yape', nombre: 'Yape', icono: 'fas fa-mobile-alt', comision: 0, disponible: true }
    ];
    metodoPagoSeleccionado: MetodoPago | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private citaService: CitaService,
        private pagosService: PagosService,
        private router: Router,
            private route: ActivatedRoute,
                private subespService: SubespecialidadService,
                private espService: EspecialidadService,
                private pacienteService: PacienteService
    ) {
        this.checkoutForm = this.fb.group({
            nombre: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            telefono: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
            numeroTarjeta: [''],
            fechaVencimiento: [''],
            cvv: [''],
            numeroYape: [''],
            observaciones: ['']
        });
    }

    ngOnInit(): void {
        // Usuario actual
        this.authSubscription = this.authService.authState$.subscribe((auth: AuthState) => {
            this.usuarioActual = auth.user;
            if (this.usuarioActual) {
                const p: any = this.usuarioActual.persona || {};
                const nombre = [p.nombre1, p.nombre2, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ').trim();
                let telefono = (p.telefono || '').toString().replace(/\s+/g, '').replace(/^\+?51/, '');
                if (telefono.length > 9) telefono = telefono.slice(0, 9);
                this.checkoutForm.patchValue({
                    nombre: nombre || this.usuarioActual.correo,
                    email: this.usuarioActual.correo,
                    telefono
                });

                // Si no tenemos teléfono aún, intentar obtenerlo desde el perfil del paciente
                const telVacio = !telefono || telefono.trim().length === 0;
                if (telVacio && this.usuarioActual.idUsuario) {
                    this.pacienteService.getByUsuario(this.usuarioActual.idUsuario).subscribe({
                        next: (pac) => {
                            const tel = (pac?.persona?.telefono || '').toString().replace(/\s+/g, '').replace(/^\+?51/, '');
                            const tel9 = tel.length > 9 ? tel.slice(0, 9) : tel;
                            if (tel9) {
                                this.checkoutForm.patchValue({ telefono: tel9 });
                                // Opcional: actualizar cache local del usuario para siguientes veces
                                if (this.usuarioActual) {
                                    const updated = { ...this.usuarioActual, persona: { ...this.usuarioActual.persona, telefono: tel9 } as any } as Usuario;
                                    this.authService.updateUser(updated);
                                }
                            }
                        }
                    });
                }
            }
        });

        // Datos de la cita desde query params
                this.route.queryParams.subscribe(params => {
            const doctor = params['doctor'];
            const especialidad = params['especialidad'];
                const idEspecialidadParam = params['idEspecialidad'];
                const idSubespecialidadParam = params['idSubespecialidad'];
            const fecha = params['fecha'] || new Date().toISOString().slice(0, 10);
            const hora = params['hora'] || '10:00';
            if (doctor && especialidad) {
                this.citaSeleccionada = {
                    id: 'CITA-' + Date.now(),
                    doctor,
                    especialidad,
                    fecha,
                    hora,
                        precio: this.obtenerPrecioPorEspecialidad(especialidad),
                    descripcion: `Consulta de ${especialidad} con ${doctor}`,
                    duracion: '30 minutos'
                };

                    // Si vienen IDs, intentar obtener precio real desde Subespecialidad
                                    const idEspecialidad = idEspecialidadParam ? Number(idEspecialidadParam) : NaN;
                                    const idSubespecialidad = idSubespecialidadParam ? Number(idSubespecialidadParam) : NaN;
                            if (!Number.isNaN(idEspecialidad)) {
                        this.subespService.getSubespecialidadesPorEspecialidad(idEspecialidad).subscribe({
                            next: (lista: Subespecialidad[]) => {
                                let precio: number | undefined;
                                if (!Number.isNaN(idSubespecialidad)) {
                                                    const match = lista.find(s => s.idSubespecialidad === idSubespecialidad);
                                                    precio = match?.precioSubespecial;
                                                    if (this.citaSeleccionada && match) {
                                                        this.citaSeleccionada.subespecialidad = match.nombre;
                                                    }
                                }
                                if (precio === undefined && lista.length) {
                                                    // fallback: elegir el menor precio disponible
                                                    const minItem = lista.reduce((prev, curr) => (curr.precioSubespecial < prev.precioSubespecial ? curr : prev), lista[0]);
                                                    precio = minItem.precioSubespecial;
                                                    if (this.citaSeleccionada) {
                                                        this.citaSeleccionada.subespecialidad = minItem.nombre;
                                                    }
                                }
                                if (this.citaSeleccionada && typeof precio === 'number' && precio > 0) {
                                    this.citaSeleccionada.precio = precio;
                                }
                            },
                            error: () => {
                                // Mantener precio por mapa como fallback
                            }
                        });
                            } else if (especialidad) {
                                // Resolver idEspecialidad a partir del nombre para obtener precio real
                                this.espService.getEspecialidades().subscribe({
                                    next: (espList: Especialidad[]) => {
                                        const espId = this.encontrarIdEspecialidadPorNombre(espList, especialidad);
                                        if (espId) {
                                                            this.subespService.getSubespecialidadesPorEspecialidad(espId).subscribe({
                                                                next: (lista: Subespecialidad[]) => {
                                                                    if (lista && lista.length && this.citaSeleccionada) {
                                                                        const minItem = lista.reduce((prev, curr) => (curr.precioSubespecial < prev.precioSubespecial ? curr : prev), lista[0]);
                                                                        this.citaSeleccionada.precio = minItem.precioSubespecial;
                                                                        this.citaSeleccionada.subespecialidad = minItem.nombre;
                                                                    }
                                                                }
                                                            });
                                        }
                                    }
                                });
                    }
            }
        });
    }

    ngOnDestroy(): void {
        this.authSubscription?.unsubscribe();
    }

    // UX: limpiar inputs
    onTelefonoInput(event: any) {
        let value = event.target.value.replace(/\s+/g, '');
        value = value.replace(/^\+?51/, '');
        if (value.length > 9) value = value.slice(0, 9);
        this.checkoutForm.get('telefono')?.setValue(value, { emitEvent: false });
    }

    onNumeroYapeInput(event: any) {
        let value = event.target.value.replace(/\s+/g, '');
        value = value.replace(/^\+?51/, '');
        if (value.length > 9) value = value.slice(0, 9);
        this.checkoutForm.get('numeroYape')?.setValue(value, { emitEvent: false });
    }

    onFechaVencimientoInput(event: any) {
        let value = event.target.value.replace(/[^\d]/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        if (value.length > 5) value = value.slice(0, 5);
        this.checkoutForm.get('fechaVencimiento')?.setValue(value, { emitEvent: false });
    }

    seleccionarMetodoPago(metodo: MetodoPago): void {
        this.metodoPagoSeleccionado = metodo;
        this.actualizarValidadores();
    }

    private actualizarValidadores(): void {
        // Limpiar
        this.checkoutForm.get('numeroTarjeta')?.clearValidators();
        this.checkoutForm.get('fechaVencimiento')?.clearValidators();
        this.checkoutForm.get('cvv')?.clearValidators();
        this.checkoutForm.get('numeroYape')?.clearValidators();

        if (this.metodoPagoSeleccionado?.id === 'tarjeta') {
            this.checkoutForm.get('numeroTarjeta')?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
            this.checkoutForm.get('fechaVencimiento')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/(\d{2})$/)]);
            this.checkoutForm.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3}$/)]);
        }
        if (this.metodoPagoSeleccionado?.id === 'yape') {
            this.checkoutForm.get('numeroYape')?.setValidators([Validators.required, Validators.pattern(/^9\d{8}$/)]);
        }

        this.checkoutForm.get('numeroTarjeta')?.updateValueAndValidity();
        this.checkoutForm.get('fechaVencimiento')?.updateValueAndValidity();
        this.checkoutForm.get('cvv')?.updateValueAndValidity();
        this.checkoutForm.get('numeroYape')?.updateValueAndValidity();
    }

    calcularComision(): number {
        if (!this.citaSeleccionada || !this.metodoPagoSeleccionado) return 0;
        return this.citaSeleccionada.precio * this.metodoPagoSeleccionado.comision;
    }

    calcularTotal(): number {
        if (!this.citaSeleccionada) return 0;
        const subtotal = this.citaSeleccionada.precio;
        const comision = this.metodoPagoSeleccionado ? this.calcularComision() : 0;
        return +(subtotal + comision).toFixed(2);
    }

    confirmarPago(): void {
        if (!this.citaSeleccionada || !this.metodoPagoSeleccionado) {
            this.pagoExitoso = false;
            return;
        }
        if (this.checkoutForm.invalid) {
            this.pagoExitoso = false;
            return;
        }

        this.procesandoPago = true;
            setTimeout(() => {
                // Simular pago OK y guardar cita + factura
                        const cita = this.guardarCitaConfirmada();
                if (cita && this.usuarioActual) {
                            // Usar el precio mostrado en checkout (sin IGV) como base
                            const precioBase = this.citaSeleccionada?.precio;
                            this.pagosService.addFacturaFromCita(cita, this.usuarioActual.correo, this.metodoPagoSeleccionado!.nombre, precioBase);
                }
                this.pagoExitoso = true;
            this.procesandoPago = false;
        }, 1500);
    }

        private guardarCitaConfirmada(): CitaCompleta | null {
            if (!this.citaSeleccionada) return null;
        const user = this.usuarioActual;

        const persona: any = user?.persona || {};
        const pacienteNombre = [persona.nombre1, persona.nombre2, persona.apellidoPaterno, persona.apellidoMaterno]
            .filter(Boolean).join(' ').trim() || user?.correo || 'Paciente';

        const cita: CitaCompleta = {
            id: 0, // será generado por el servicio
            pacienteNombre,
            doctorNombre: this.citaSeleccionada.doctor,
            especialidad: this.citaSeleccionada.especialidad,
            subespecialidad: this.citaSeleccionada.subespecialidad,
            fecha: this.citaSeleccionada.fecha,
            hora: this.citaSeleccionada.hora,
            estado: 'confirmada',
            pacienteEmail: user?.correo || '',
            pacienteTelefono: persona.telefono || '',
            tipoConsulta: 'consulta-general',
            motivoConsulta: 'Reserva vía checkout',
            notasAdicionales: this.checkoutForm.get('observaciones')?.value || '',
            precio: this.citaSeleccionada.precio,
            fechaCreacion: new Date().toISOString(),
            duracionEstimada: 30
        } as CitaCompleta;

            this.citaService.guardarCita(cita);
            return cita;
    }

    volver(): void {
        this.router.navigate(['/citas']);
    }

    irAMisCitas(): void {
        this.router.navigate(['/paciente/mis-citas']);
    }

    get mostrarCamposTarjeta(): boolean {
        return this.metodoPagoSeleccionado?.id === 'tarjeta';
    }

    get mostrarCamposYape(): boolean {
        return this.metodoPagoSeleccionado?.id === 'yape';
    }

    private obtenerPrecioPorEspecialidad(especialidad: string): number {
        const precios: Record<string, number> = {
            'Cardiología': 150,
            'Dermatología': 120,
            'Pediatría': 100,
            'Ginecología': 130,
            'Medicina General': 80,
            'Traumatología': 140,
            'Psicología': 110,
            'Odontología': 90,
            'Oftalmología': 110,
            'Neurología': 160,
            'Endocrinología': 150,
            'Reumatología': 140,
            'Urología': 130
        };
        return precios[especialidad] ?? 100;
    }

        private normalizarTexto(t: string): string {
            return t
                .toLowerCase()
                .normalize('NFD')
                .replace(/\p{Diacritic}/gu, '')
                .trim();
        }

        private encontrarIdEspecialidadPorNombre(lista: Especialidad[], nombre: string): number | null {
            const objetivo = this.normalizarTexto(nombre);
            const encontrada = lista.find(e => this.normalizarTexto(e.nombre) === objetivo);
            return encontrada?.idEspecialidad ?? null;
        }
}
