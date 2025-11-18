import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, AuthState } from '../../../../../core/services/auth/auth.service';
import { Usuario } from '../../../../../core/models/users/usuario';
import { UserService } from '../../../../../core/services/auth/user.service';
import { PagosService, Factura as FacturaLocal } from '../../../../../core/services/logic/pagos.service';

interface Factura {
    id: string;
    numeroFactura: string;
    fecha: Date;
    fechaVencimiento: Date;
    concepto: string;
    descripcion: string;
    doctor: string;
    especialidad: string;
    subespecialidad?: string;
    subtotal: number;
    igv: number;
    total: number;
    estado: 'pendiente' | 'pagado' | 'vencido' | 'cancelado';
    metodoPago?: string;
    fechaPago?: Date;
    numeroTransaccion?: string;
}

interface MetodoPago {
    id: string;
    tipo: 'tarjeta' | 'efectivo' | 'transferencia' | 'yape' | 'plin';
    nombre: string;
    icono: string;
    disponible: boolean;
    comision: number;
}

interface PlanPago {
    id: string;
    nombre: string;
    cuotas: number;
    interes: number;
    descripcion: string;
}

@Component({
    selector: 'app-pagos',
    imports: [CommonModule, FormsModule],
    templateUrl: './pagos.component.html',
    styleUrls: ['./pagos.component.css']
})
export class PagosComponent implements OnInit, OnDestroy {

    usuarioActual: Usuario | null = null;
    authSubscription: Subscription | null = null;

    // Datos de pagos
    facturas: Factura[] = [];
    metodosPago: MetodoPago[] = [];
    planesPago: PlanPago[] = [];

    // Filtros y estado
    filtroEstado: string = 'todos';
    filtroFecha: string = '';
    // Nota: este componente mostrará únicamente pagos realizados (historial).
    // Se mantienen otras propiedades por compatibilidad, pero la UI sólo usará los getters abajo.
    vistaActiva: 'facturas' | 'pagar' | 'historial' = 'historial';

    // Pago
    facturaSeleccionada: Factura | null = null;
    metodoPagoSeleccionado: MetodoPago | null = null;
    planPagoSeleccionado: PlanPago | null = null;
    mostrarModalPago: boolean = false;
    procesandoPago: boolean = false;

    // Estadísticas
    totalPendiente: number = 0;
    totalPagado: number = 0;
    totalVencido: number = 0;

    constructor(private authService: AuthService, public userService: UserService, private pagosService: PagosService) { }

    ngOnInit(): void {
        this.authSubscription = this.authService.authState$.subscribe((authState: AuthState) => {
            if (authState.user) {
                this.usuarioActual = authState.user as Usuario;
                this.cargarDatosPagos();
            }
        });

        this.inicializarMetodosPago();
        this.inicializarPlanesPago();
    }

    ngOnDestroy(): void {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }

    private cargarDatosPagos(): void {
        if (this.usuarioActual) {
            const email = this.usuarioActual.correo;
            const mias = this.pagosService.getFacturasByEmail(email).map(this.mapFacturaLocalAUI);
            // Mostrar únicamente las facturas reales del usuario (las generadas desde Checkout)
            this.facturas = [...mias];
            this.calcularEstadisticas();
        }
    }

    private mapFacturaLocalAUI = (f: FacturaLocal): Factura => ({
        id: f.id,
        numeroFactura: f.numeroFactura,
        fecha: new Date(f.fecha),
        fechaVencimiento: new Date(f.fechaVencimiento),
        concepto: f.concepto,
        descripcion: f.descripcion,
        doctor: f.doctor,
        especialidad: f.especialidad,
    subespecialidad: f.subespecialidad,
            // Normalizar: sin IGV en la UI. Mostrar siempre total = subtotal
            subtotal: f.subtotal,
            igv: 0,
            total: f.subtotal,
        estado: f.estado,
        metodoPago: f.metodoPago,
        fechaPago: f.fechaPago ? new Date(f.fechaPago) : undefined,
        numeroTransaccion: f.numeroTransaccion
    });

    private generarFacturasProfesionales(): Factura[] {
        const displayName = this.userService.getDisplayName();
        const fechaBase = new Date();

        return [
            {
                id: 'FAC-001',
                numeroFactura: 'F001-00000123',
                fecha: new Date(fechaBase.getTime() - 5 * 24 * 60 * 60 * 1000),
                fechaVencimiento: new Date(fechaBase.getTime() + 25 * 24 * 60 * 60 * 1000),
                concepto: 'Consulta Médica Especializada',
                descripcion: `Consulta cardiológica preventiva para paciente ${displayName}`,
                doctor: 'Dr. Roberto Silva Vargas',
                especialidad: 'Cardiología',
                subtotal: 150.00,
                igv: 27.00,
                total: 177.00,
                estado: 'pendiente'
            },
            {
                id: 'FAC-002',
                numeroFactura: 'F001-00000122',
                fecha: new Date(fechaBase.getTime() - 35 * 24 * 60 * 60 * 1000),
                fechaVencimiento: new Date(fechaBase.getTime() - 5 * 24 * 60 * 60 * 1000),
                concepto: 'Análisis Clínicos Completos',
                descripcion: 'Hemograma, perfil lipídico, glucosa, función renal y hepática',
                doctor: 'Lab. Carlos Mendoza',
                especialidad: 'Laboratorio Clínico',
                subtotal: 85.00,
                igv: 15.30,
                total: 100.30,
                estado: 'pagado',
                metodoPago: 'Tarjeta de Crédito',
                fechaPago: new Date(fechaBase.getTime() - 30 * 24 * 60 * 60 * 1000),
                numeroTransaccion: 'TXN-789456123'
            },
            {
                id: 'FAC-003',
                numeroFactura: 'F001-00000121',
                fecha: new Date(fechaBase.getTime() - 60 * 24 * 60 * 60 * 1000),
                fechaVencimiento: new Date(fechaBase.getTime() - 30 * 24 * 60 * 60 * 1000),
                concepto: 'Consulta Medicina General',
                descripcion: 'Evaluación médica general y chequeo preventivo anual',
                doctor: 'Dr. María González Rodríguez',
                especialidad: 'Medicina General',
                subtotal: 80.00,
                igv: 14.40,
                total: 94.40,
                estado: 'pagado',
                metodoPago: 'Yape',
                fechaPago: new Date(fechaBase.getTime() - 55 * 24 * 60 * 60 * 1000),
                numeroTransaccion: 'YPE-456789012'
            },
            {
                id: 'FAC-004',
                numeroFactura: 'F001-00000120',
                fecha: new Date(fechaBase.getTime() - 90 * 24 * 60 * 60 * 1000),
                fechaVencimiento: new Date(fechaBase.getTime() - 60 * 24 * 60 * 60 * 1000),
                concepto: 'Vacunación COVID-19',
                descripcion: 'Dosis de refuerzo vacuna COVID-19 Pfizer-BioNTech',
                doctor: 'Enf. Ana Lucia Torres',
                especialidad: 'Inmunización',
                subtotal: 25.00,
                igv: 4.50,
                total: 29.50,
                estado: 'vencido'
            },
            {
                id: 'FAC-005',
                numeroFactura: 'F001-00000119',
                fecha: new Date(fechaBase.getTime() - 120 * 24 * 60 * 60 * 1000),
                fechaVencimiento: new Date(fechaBase.getTime() + 10 * 24 * 60 * 60 * 1000),
                concepto: 'Tratamiento Fisioterapia',
                descripcion: 'Sesiones de rehabilitación física - Paquete 5 sesiones',
                doctor: 'Lic. Patricia Morales',
                especialidad: 'Fisioterapia',
                subtotal: 200.00,
                igv: 36.00,
                total: 236.00,
                estado: 'pendiente'
            }
        ];
    }

    private inicializarMetodosPago(): void {
        this.metodosPago = [
            {
                id: 'tarjeta',
                tipo: 'tarjeta',
                nombre: 'Tarjeta de Crédito/Débito',
                icono: 'fas fa-credit-card',
                disponible: true,
                comision: 0.035
            },
            {
                id: 'yape',
                tipo: 'yape',
                nombre: 'Yape',
                icono: 'fas fa-mobile-alt',
                disponible: true,
                comision: 0
            },
            {
                id: 'plin',
                tipo: 'plin',
                nombre: 'Plin',
                icono: 'fas fa-wallet',
                disponible: true,
                comision: 0
            },
            {
                id: 'transferencia',
                tipo: 'transferencia',
                nombre: 'Transferencia Bancaria',
                icono: 'fas fa-university',
                disponible: true,
                comision: 0
            },
            {
                id: 'efectivo',
                tipo: 'efectivo',
                nombre: 'Efectivo (Caja)',
                icono: 'fas fa-money-bill-wave',
                disponible: true,
                comision: 0
            }
        ];
    }

    private inicializarPlanesPago(): void {
        this.planesPago = [
            {
                id: 'contado',
                nombre: 'Pago al Contado',
                cuotas: 1,
                interes: 0,
                descripcion: 'Pago completo sin intereses'
            },
            {
                id: 'cuotas-2',
                nombre: '2 Cuotas',
                cuotas: 2,
                interes: 0.05,
                descripcion: 'Pago en 2 cuotas mensuales + 5% interés'
            },
            {
                id: 'cuotas-3',
                nombre: '3 Cuotas',
                cuotas: 3,
                interes: 0.08,
                descripcion: 'Pago en 3 cuotas mensuales + 8% interés'
            }
        ];
    }

    private calcularEstadisticas(): void {
        this.totalPendiente = this.facturas
            .filter(f => f.estado === 'pendiente')
            .reduce((sum, f) => sum + f.total, 0);

        this.totalPagado = this.facturas
            .filter(f => f.estado === 'pagado')
            .reduce((sum, f) => sum + f.total, 0);

        this.totalVencido = this.facturas
            .filter(f => f.estado === 'vencido')
            .reduce((sum, f) => sum + f.total, 0);
    }

    /**
     * Devuelve las facturas cuyo estado sea 'pagado', ordenadas por fecha de pago descendente.
     */
    get facturasPagadas(): Factura[] {
        return this.facturas
            .filter(f => f.estado === 'pagado')
            .sort((a, b) => (b.fechaPago ? b.fechaPago.getTime() : b.fecha.getTime()) - (a.fechaPago ? a.fechaPago.getTime() : a.fecha.getTime()));
    }

    /**
     * Facturas recientes: las 3 últimas facturas pagadas (puedes ajustar el número aquí).
     */
    get facturasRecientes(): Factura[] {
        return this.facturasPagadas.slice(0, 3);
    }

    get facturasFiltradas(): Factura[] {
        let facturas = this.facturas;

        if (this.filtroEstado !== 'todos') {
            facturas = facturas.filter(f => f.estado === this.filtroEstado);
        }

        return facturas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    }

    seleccionarFactura(factura: Factura): void {
        if (factura.estado === 'pendiente' || factura.estado === 'vencido') {
            this.facturaSeleccionada = factura;
            this.vistaActiva = 'pagar';
        }
    }

    seleccionarMetodoPago(metodo: MetodoPago): void {
        this.metodoPagoSeleccionado = metodo;
    }

    seleccionarPlanPago(plan: PlanPago): void {
        this.planPagoSeleccionado = plan;
    }

    calcularTotalConInteres(): number {
        if (!this.facturaSeleccionada || !this.planPagoSeleccionado) return 0;

        const total = this.facturaSeleccionada.total;
        const interes = total * this.planPagoSeleccionado.interes;
        return total + interes;
    }

    calcularCuotaMensual(): number {
        if (!this.planPagoSeleccionado) return 0;

        const totalConInteres = this.calcularTotalConInteres();
        return totalConInteres / this.planPagoSeleccionado.cuotas;
    }

    procesarPago(): void {
        if (!this.facturaSeleccionada || !this.metodoPagoSeleccionado || !this.planPagoSeleccionado) {
            return;
        }

        this.procesandoPago = true;

        // Simular procesamiento de pago
        setTimeout(() => {
            // Actualizar la factura
            this.facturaSeleccionada!.estado = 'pagado';
            this.facturaSeleccionada!.metodoPago = this.metodoPagoSeleccionado!.nombre;
            this.facturaSeleccionada!.fechaPago = new Date();
            this.facturaSeleccionada!.numeroTransaccion = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();

            // Recalcular estadísticas
            this.calcularEstadisticas();

            // Limpiar selecciones
            this.facturaSeleccionada = null;
            this.metodoPagoSeleccionado = null;
            this.planPagoSeleccionado = null;
            this.procesandoPago = false;

            // Volver a la vista de facturas
            this.vistaActiva = 'facturas';

            // Mostrar mensaje de éxito
            alert('¡Pago procesado exitosamente!');
        }, 3000);
    }

    cancelarPago(): void {
        this.facturaSeleccionada = null;
        this.metodoPagoSeleccionado = null;
        this.planPagoSeleccionado = null;
        this.vistaActiva = 'facturas';
    }

    obtenerColorEstado(estado: string): string {
        const colores = {
            'pendiente': 'var(--amarillo)',
            'pagado': 'var(--verde)',
            'vencido': 'var(--rojo)',
            'cancelado': 'var(--gris)'
        };
        return colores[estado as keyof typeof colores] || 'var(--gris)';
    }

    obtenerIconoEstado(estado: string): string {
        const iconos = {
            'pendiente': 'fas fa-clock',
            'pagado': 'fas fa-check-circle',
            'vencido': 'fas fa-exclamation-triangle',
            'cancelado': 'fas fa-times-circle'
        };
        return iconos[estado as keyof typeof iconos] || 'fas fa-file';
    }

    descargarFactura(factura: Factura): void {
        // Simular descarga de factura
        alert(`Descargando factura ${factura.numeroFactura}`);
    }

}
