import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, catchError, of } from 'rxjs';
import { AuthService, AuthState } from '../../../../../core/services/auth/auth.service';
import { Usuario } from '../../../../../core/models/users/usuario';
import { UserService } from '../../../../../core/services/auth/user.service';
import { Paciente } from '../../../../../core/models/users/paciente';
import { PacienteService } from '../../../../../core/services/rol/paciente.service';

interface RegistroMedico {
    id: string;
    fecha: Date;
    tipo: 'consulta' | 'examen' | 'tratamiento' | 'cirugia' | 'vacuna' | 'emergencia';
    doctor: string;
    especialidad: string;
    diagnostico: string;
    tratamiento: string;
    observaciones: string;
    estado: 'completado' | 'en-progreso' | 'pendiente';
    confidencial: boolean;
}

@Component({
    selector: 'app-historial-medico',
    imports: [CommonModule, FormsModule],
    templateUrl: './historial-medico.component.html',
    styleUrls: ['./historial-medico.component.css']
})
export class HistorialMedicoComponent implements OnInit, OnDestroy {

    usuarioActual: Usuario | null = null;
    authSubscription: Subscription | null = null;

    // Registros médicos del paciente
    registrosMedicos: RegistroMedico[] = [];

    // Datos complementarios del paciente (desde PacienteService)
    datosPaciente: Paciente | null = null;

    // Filtros
    filtroTipo: string = 'todos';
    filtroFecha: string = '';
    mostrarSoloConfidencial: boolean = false;

    // Estado de la interfaz
    vistaDetallada: boolean = false;
    registroSeleccionado: RegistroMedico | null = null;

    constructor(
        public userService: UserService,
        private authService: AuthService,
        private pacienteService: PacienteService
    ) { }

    ngOnInit(): void {
        this.authSubscription = this.authService.authState$.subscribe((authState: AuthState) => {
            if (authState.user) {
                this.usuarioActual = authState.user as Usuario;
                this.cargarHistorialMedico();
                this.cargarDatosPaciente();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }

    private cargarHistorialMedico(): void {
        if (this.usuarioActual) {
            // Generar historial médico profesional y confidencial
            this.registrosMedicos = this.generarHistorialProfesional();
        }
    }

    private cargarDatosPaciente(): void {
        const idUsuario = this.usuarioActual?.idUsuario || 0;
        if (!idUsuario) return;
        this.pacienteService.getByUsuario(idUsuario)
            .pipe(catchError(() => of(null)))
            .subscribe((pac) => {
                this.datosPaciente = pac as Paciente | null;
            });
    }

    // Helpers para template estricto
    get dniMostrar(): string {
        const dniUser = this.usuarioActual?.persona?.dni || '';
        const dniPac = this.datosPaciente?.persona?.dni || '';
        return dniUser || dniPac || '—';
    }

    private generarHistorialProfesional(): RegistroMedico[] {
    const displayName = this.userService.getDisplayName();
    const dni = this.usuarioActual?.persona?.dni || this.datosPaciente?.persona?.dni || '';
        const fechaBase = new Date();

        return [
            {
                id: 'HM-001',
                fecha: new Date(fechaBase.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
                tipo: 'consulta',
                doctor: 'Dr. María González Rodríguez',
                especialidad: 'Medicina General',
                diagnostico: 'Evaluación médica general - Estado de salud óptimo',
                tratamiento: 'Continuar con hábitos saludables. Control preventivo anual.',
                observaciones: `EVALUACIÓN CONFIDENCIAL:\n\nPaciente ${displayName} acude a consulta preventiva.\n\nEXAMEN FÍSICO:\n- Signos vitales estables\n- Peso y talla dentro de parámetros normales\n- No se observan alteraciones significativas\n\nRECOMENDACIONES:\n- Mantener dieta balanceada\n- Ejercicio regular\n- Control médico anual\n\nPRÓXIMA CITA: Programar en 12 meses para seguimiento preventivo.`,
                estado: 'completado',
                confidencial: true
            },
            {
                id: 'HM-002',
                fecha: new Date(fechaBase.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 días atrás
                tipo: 'examen',
                doctor: 'Lab. Carlos Mendoza',
                especialidad: 'Laboratorio Clínico',
                diagnostico: 'Análisis clínicos de rutina - Resultados normales',
                tratamiento: 'No requiere tratamiento. Valores dentro de rangos normales.',
                observaciones: `RESULTADOS CONFIDENCIALES DE LABORATORIO:\n\nPaciente: ${displayName}\nDNI: ${dni}\n\nEXÁMENES REALIZADOS:\n✓ Hemograma completo: Normal\n✓ Glucosa en ayunas: 85 mg/dL (Normal)\n✓ Colesterol total: 180 mg/dL (Deseable)\n✓ Triglicéridos: 120 mg/dL (Normal)\n✓ Función renal: Normal\n✓ Función hepática: Normal\n\nCONCLUSIÓN: Todos los parámetros dentro de valores de referencia.\nSe recomienda mantener estilo de vida saludable.`,
                estado: 'completado',
                confidencial: true
            },
            {
                id: 'HM-003',
                fecha: new Date(fechaBase.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 días atrás
                tipo: 'vacuna',
                doctor: 'Enf. Ana Lucia Torres',
                especialidad: 'Inmunización',
                diagnostico: 'Vacunación preventiva - Esquema actualizado',
                tratamiento: 'Vacuna aplicada según protocolo nacional de inmunización.',
                observaciones: `REGISTRO DE VACUNACIÓN CONFIDENCIAL:\n\nPaciente: ${displayName}\n\nVACUNA APLICADA:\n- Vacuna COVID-19 (Refuerzo)\n- Lote: CV-2024-089\n- Laboratorio: Pfizer-BioNTech\n- Vía: Intramuscular\n- Sitio: Deltoides izquierdo\n\nREACCIONES ADVERSAS: Ninguna reportada\nPRÓXIMO REFUERZO: Según indicaciones del MINSA\n\nCERTIFICADO EMITIDO: Sí\nVÁLIDO PARA: Viajes nacionales e internacionales`,
                estado: 'completado',
                confidencial: false
            },
            {
                id: 'HM-004',
                fecha: new Date(fechaBase.getTime() - 180 * 24 * 60 * 60 * 1000), // 180 días atrás
                tipo: 'consulta',
                doctor: 'Dr. Roberto Silva Vargas',
                especialidad: 'Cardiología',
                diagnostico: 'Evaluación cardiológica preventiva - Sin alteraciones',
                tratamiento: 'No requiere tratamiento específico. Continuar con actividad física.',
                observaciones: `EVALUACIÓN CARDIOLÓGICA CONFIDENCIAL:\n\nMotivo: Chequeo preventivo solicitado por medicina general\n\nEXAMEN CARDIOVASCULAR:\n- Auscultación cardíaca: Ruidos cardíacos normales\n- Presión arterial: 120/80 mmHg\n- Frecuencia cardíaca: 72 lpm\n- ECG: Ritmo sinusal normal\n\nEVALUACIÓN DE RIESGO CARDIOVASCULAR:\n- Riesgo bajo según escala de Framingham\n- No factores de riesgo significativos\n\nRECOMENDACIONES:\n- Ejercicio aeróbico regular (150 min/semana)\n- Dieta mediterránea\n- Control anual`,
                estado: 'completado',
                confidencial: true
            }
        ];
    }

    get registrosFiltrados(): RegistroMedico[] {
        let registros = this.registrosMedicos;

        if (this.filtroTipo !== 'todos') {
            registros = registros.filter(r => r.tipo === this.filtroTipo);
        }

        if (this.mostrarSoloConfidencial) {
            registros = registros.filter(r => r.confidencial);
        }

        return registros.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    }

    get totalRegistrosConfidenciales(): number {
        return this.registrosMedicos.filter(r => r.confidencial).length;
    }

    seleccionarRegistro(registro: RegistroMedico): void {
        this.registroSeleccionado = registro;
        this.vistaDetallada = true;
    }

    cerrarDetalle(): void {
        this.vistaDetallada = false;
        this.registroSeleccionado = null;
    }

    obtenerIconoTipo(tipo: string): string {
        const iconos = {
            'consulta': 'fas fa-stethoscope',
            'examen': 'fas fa-vial',
            'tratamiento': 'fas fa-pills',
            'cirugia': 'fas fa-cut',
            'vacuna': 'fas fa-syringe',
            'emergencia': 'fas fa-exclamation-triangle'
        };
        return iconos[tipo as keyof typeof iconos] || 'fas fa-file-medical';
    }

    obtenerColorEstado(estado: string): string {
        const colores = {
            'completado': 'var(--verde)',
            'en-progreso': 'var(--amarillo)',
            'pendiente': 'var(--rojo)'
        };
        return colores[estado as keyof typeof colores] || 'var(--gris)';
    }

}
