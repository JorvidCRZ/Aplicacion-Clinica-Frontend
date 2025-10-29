// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule } from '@angular/forms';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router, ActivatedRoute } from '@angular/router';
// import { Subscription } from 'rxjs';
// import { AuthService, AuthState } from '../../../core/services/rol/auth.service';
// import { Paciente } from '../../../core/models/users/paciente';

// interface CitaMedica {
//   id: string;
//   doctor: string;
//   especialidad: string;
//   fecha: string;
//   hora: string;
//   precio: number;
//   descripcion: string;
//   duracion: string;
// }

// interface MetodoPago {
//   id: string;
//   nombre: string;
//   icono: string;
//   comision: number;
//   disponible: boolean;
// }

// @Component({
//   selector: 'app-checkout',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './checkout.component.html',
//   styleUrls: ['./checkout.component.css']
// })
// export class CheckoutComponent implements OnInit, OnDestroy {
//   irAMisCitas() {
//     this.router.navigate(['/paciente/mis-citas']);
//   }
//   // ...existing code...

//   // UX: limpiar teléfono y formatear fecha de vencimiento
//   onTelefonoInput(event: any) {
//     let value = event.target.value.replace(/\s+/g, '');
//     value = value.replace(/^\+?51/, '');
//     if (value.length > 9) value = value.slice(0, 9);
//     this.checkoutForm.get('telefono')?.setValue(value, { emitEvent: false });
//   }

//   onNumeroYapeInput(event: any) {
//     let value = event.target.value.replace(/\s+/g, '');
//     value = value.replace(/^\+?51/, '');
//     if (value.length > 9) value = value.slice(0, 9);
//     this.checkoutForm.get('numeroYape')?.setValue(value, { emitEvent: false });
//   }

//   onFechaVencimientoInput(event: any) {
//     let value = event.target.value.replace(/[^\d]/g, '');
//     if (value.length > 2) {
//       value = value.slice(0, 2) + '/' + value.slice(2, 4);
//     }
//     if (value.length > 5) value = value.slice(0, 5);
//     this.checkoutForm.get('fechaVencimiento')?.setValue(value, { emitEvent: false });
//   }
//   checkoutForm: FormGroup;
//   pagoExitoso: boolean | null = null;
//   procesandoPago: boolean = false;

//   // Datos de la cita
//   citaSeleccionada: CitaMedica | null = null;
//   usuarioActual: Paciente | null = null;
//   authSubscription: Subscription | null = null;

//   // Métodos de pago
//   metodosPago: MetodoPago[] = [
//     {
//       id: 'tarjeta',
//       nombre: 'Tarjeta de Crédito/Débito',
//       icono: 'fas fa-credit-card',
//       comision: 0.035,
//       disponible: true
//     },
//     {
//       id: 'yape',
//       nombre: 'Yape',
//       icono: 'fas fa-mobile-alt',
//       comision: 0,
//       disponible: true
//     }
//   ];

//   metodoPagoSeleccionado: MetodoPago | null = null;

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private router: Router,
//     private route: ActivatedRoute
//   ) {
//     this.checkoutForm = this.fb.group({
//       // Datos del paciente
//       nombre: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       telefono: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],

//       // Datos de pago para tarjeta
//       numeroTarjeta: [''],
//       fechaVencimiento: [''],
//       cvv: [''],

//       // Datos de pago para Yape/Plin
//       numeroYape: [''],

//       // Notas adicionales
//       observaciones: ['']
//     });
//   }

//   ngOnInit(): void {
//     // Obtener datos del usuario actual
//     this.authSubscription = this.authService.authState$.subscribe((authState: AuthState) => {
//       if (authState.user && authState.user.rol?.nombre === 'Paciente') {
//         this.cargarDatosUsuario();
//       }
//     });

//     // Obtener datos de la cita desde los parámetros de la URL o localStorage
//     this.cargarDatosCita();
//   }

//   ngOnDestroy(): void {
//     if (this.authSubscription) {
//       this.authSubscription.unsubscribe();
//     }
//   }

//   private cargarDatosUsuario(): void {
//     if (this.usuarioActual) {
//       // Limpiar el teléfono por defecto
//       let telefono = this.usuarioActual.persona.telefono || '';
//       telefono = telefono.replace(/\s+/g, '');
//       telefono = telefono.replace(/^\+?51/, '');
//       if (telefono.length > 9) telefono = telefono.slice(0, 9);
//       this.checkoutForm.patchValue({
//         nombre: `${this.usuarioActual.persona?.nombre} ${this.usuarioActual.persona?.apellidoPaterno || ''} ${this.usuarioActual.persona?.apellidoMaterno || ''}`.trim(),
//         email: this.usuarioActual.usuarioAgrego?.correo || '',
//         telefono: telefono
//       });
//     }
//   }

//   private cargarDatosCita(): void {
//     // Intentar obtener datos de la cita desde query params o localStorage
//     this.route.queryParams.subscribe(params => {
//       if (params['doctor'] && params['especialidad']) {
//         this.citaSeleccionada = {
//           id: 'CITA-' + Date.now(),
//           doctor: params['doctor'],
//           especialidad: params['especialidad'],
//           fecha: params['fecha'] || new Date().toISOString().split('T')[0],
//           hora: params['hora'] || '10:00',
//           precio: this.obtenerPrecioPorEspecialidad(params['especialidad']),
//           descripcion: `Consulta de ${params['especialidad']} con ${params['doctor']}`,
//           duracion: '30 minutos'
//         };
//       } else {
//         // Si no hay parámetros, crear una cita de ejemplo
//         this.citaSeleccionada = {
//           id: 'CITA-' + Date.now(),
//           doctor: 'Dr. Juan Pérez',
//           especialidad: 'Medicina General',
//           fecha: new Date().toISOString().split('T')[0],
//           hora: '10:00',
//           precio: 80.00,
//           descripcion: 'Consulta médica general',
//           duracion: '30 minutos'
//         };
//       }
//     });
//   }

//   private obtenerPrecioPorEspecialidad(especialidad: string): number {
//     const precios = {
//       'Cardiología': 150.00,
//       'Dermatología': 120.00,
//       'Pediatría': 100.00,
//       'Ginecología': 130.00,
//       'Medicina General': 80.00,
//       'Traumatología': 140.00,
//       'Psicología': 110.00,
//       'Odontología': 90.00,
//       'Anestesiología': 160.00
//     };
//     return precios[especialidad as keyof typeof precios] || 80.00;
//   }

//   seleccionarMetodoPago(metodo: MetodoPago): void {
//     this.metodoPagoSeleccionado = metodo;
//     this.actualizarValidadores();
//   }

//   private actualizarValidadores(): void {
//     // Limpiar validadores previos
//     this.checkoutForm.get('numeroTarjeta')?.clearValidators();
//     this.checkoutForm.get('fechaVencimiento')?.clearValidators();
//     this.checkoutForm.get('cvv')?.clearValidators();
//     this.checkoutForm.get('numeroYape')?.clearValidators();

//     if (this.metodoPagoSeleccionado?.id === 'tarjeta') {
//       this.checkoutForm.get('numeroTarjeta')?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
//       this.checkoutForm.get('fechaVencimiento')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/(\d{2})$/)]);
//       this.checkoutForm.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3}$/)]);
//     } else if (this.metodoPagoSeleccionado?.id === 'yape' || this.metodoPagoSeleccionado?.id === 'plin') {
//       this.checkoutForm.get('numeroYape')?.setValidators([Validators.required, Validators.pattern(/^9\d{8}$/)]);
//     }

//     // Actualizar validadores
//     this.checkoutForm.get('numeroTarjeta')?.updateValueAndValidity();
//     this.checkoutForm.get('fechaVencimiento')?.updateValueAndValidity();
//     this.checkoutForm.get('cvv')?.updateValueAndValidity();
//     this.checkoutForm.get('numeroYape')?.updateValueAndValidity();
//   }

//   calcularTotal(): number {
//     if (!this.citaSeleccionada || !this.metodoPagoSeleccionado) return 0;

//     const precio = this.citaSeleccionada.precio;
//     const comision = precio * this.metodoPagoSeleccionado.comision;
//     return precio + comision;
//   }

//   calcularComision(): number {
//     if (!this.citaSeleccionada || !this.metodoPagoSeleccionado) return 0;

//     return this.citaSeleccionada.precio * this.metodoPagoSeleccionado.comision;
//   }

//   confirmarPago(): void {
//     if (!this.citaSeleccionada || !this.metodoPagoSeleccionado) {
//       this.pagoExitoso = false;
//       return;
//     }
//     if (this.checkoutForm.invalid) {
//       this.pagoExitoso = false;
//       return;
//     }
//     this.procesandoPago = true;
//     // Simular procesamiento de pago
//     setTimeout(() => {
//       this.pagoExitoso = true;
//       this.procesandoPago = false;
//       // Ya no redirige automáticamente, el usuario decide con el botón
//     }, 2000);
//   }

//   volver(): void {
//     this.router.navigate(['/citas']);
//   }

//   get mostrarCamposTarjeta(): boolean {
//     return this.metodoPagoSeleccionado?.id === 'tarjeta';
//   }

//   get mostrarCamposYape(): boolean {
//     return this.metodoPagoSeleccionado?.id === 'yape';
//   }
// }