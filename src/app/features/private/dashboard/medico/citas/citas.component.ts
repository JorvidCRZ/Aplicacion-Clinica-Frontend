import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { CitaService } from '../../../../../core/services/logic/cita.service';
import { CitaCompletaFull } from '../../../../../core/models/common/cita';
// import CitaCompleta removed — backend used directly
import { MedicosService } from '../../../../../core/services/logic/medico.service';
import { HistorialMedicoService } from '../../../../../core/services/logic/historial-medico.service';




// 📅 Interfaces para gestión de citas del doctor
interface Paciente {
    id: number;
    nombre: string;
    documento: string;
    telefono: string;
    email: string;
}

interface Cita {
    id: number;
    fecha: string;
    hora: string;
    paciente: Paciente;
    tipoConsulta: string;
    especialidad: string; // Nueva propiedad
    motivo?: string;
    estado: 'programada' | 'completada' | 'cancelada' | 'no-show';
    duracionEstimada: number; // en minutos
}

interface DoctorVM {
    id: number;
    nombre: string;
    apellidoPaterno?: string;
    correo: string;
    especialidad?: string;
}




@Component({
    selector: 'app-citas',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './citas.component.html',
    styleUrl: './citas.component.css'
})
export class CitasComponent implements OnInit {
    private authService = inject(AuthService);
    private citasSrv = inject(CitaService);
    private medicosSrv = inject(MedicosService);
    private historialSrv = inject(HistorialMedicoService);
    private router = inject(Router);

    detalleCita: CitaCompletaFull | null = null; // Almacena la cita completa obtenida del backend
    mostrarModal = false;            // Controla la visibilidad del modal
    showRawDetalle = false;
    showActions = false;
    // Crear historial (modal interno)
    crearHistorialVisible = false;
    crearHistorialLoading = false;
    crearHistorialError: string | null = null;
    crearHistorialForm: {
        idPaciente: number | null;
        idCita: number | null;
        idMedico: number | null;
        diagnostico: string;
        observaciones: string;
        receta: string;
        fecha: string | null;
    } = {
        idPaciente: null,
        idCita: null,
        idMedico: null,
        diagnostico: '',
        observaciones: '',
        receta: '',
        fecha: null
    };
    pacienteInfo: any | null = null;
    medicoInfo: any | null = null;

    // 👨‍⚕️ Doctor actual
    doctorActual: DoctorVM | null = null;

    // 📊 Datos de citas
    citasOriginales: Cita[] = [];
    citasFiltradas: Cita[] = [];
    citasPaginadas: Cita[] = []; // Nueva propiedad para paginación

    // 🎛️ Filtros
    filtroFecha = '';
    filtroEstado = '';
    busquedaPaciente = '';

    // 📊 Paginación Híbrida
    paginaActual = 1;
    registrosPorPagina = 10;
    totalPaginas = 0;
    registrosIniciales = 0;
    registrosFinales = 0;
    totalRegistros = 0;

    // 🔄 Carga por lotes
    citasVisibles: Cita[] = []; // Citas actualmente visibles
    lotesPorPagina = 2; // Cuántos lotes mostrar por página
    cargandoMas = false;
    hayMasRegistros = true;

    // 📋 Solicitudes pendientes
    solicitudesCancelacion: Map<number, boolean> = new Map(); // ID cita -> pendiente

    // Estado de actualización por fila (idCita -> loading)
    updatingEstado: Map<number, boolean> = new Map();

    // Opciones ordenadas de estados que muestra la UI (label -> valor enviado al backend)
    estadosOptions: Array<{ value: string; label: string }> = [
        { value: 'programada', label: 'Programada' },
        { value: 'completada', label: 'Completada' },
        { value: 'no-show', label: 'No Show' },
        { value: 'cancelada', label: 'Cancelada' }
    ];

    // Valor seleccionado en el select del modal de detalles
    modalSelectedEstado: string = '';

    // 📈 Estadísticas
    citasHoy = 0;
    citasPendientes = 0;
    citasCompletadas = 0;
    tiempoEstimadoHoy = 0;
    eficienciaDia = 94;
    proximaCita: Cita | null = null;

    ngOnInit(): void {
        this.obtenerDoctorActual();
    }

    // 👨‍⚕️ Obtener doctor logueado
    private obtenerDoctorActual(): void {
        const user: any = this.authService.currentUser;
        if (!user) return;
        const p = user.persona || {};
        const correo = user.correo || '';
        // No usar localStorage: obtenemos especialidad/id_medico siempre desde el backend
        const especialidadLS = undefined;
        // Inicialmente llenamos datos desde el usuario, pero NO asumimos id_medico => lo resolveremos
        this.doctorActual = {
            id: 0,
            nombre: `${p.nombre1 || ''}`.trim(),
            apellidoPaterno: p.apellidoPaterno || '',
            correo,
            especialidad: especialidadLS
        };
        console.log('👨‍⚕️ Doctor (user data):', this.doctorActual);

        const idUsuario = user.idUsuario || 0;
        if (!idUsuario) {
            console.warn('No idUsuario disponible en currentUser; procediendo con datos actuales');
            this.cargarCitas();
            return;
        }

        // Obtener el registro médico (que contiene id_medico) a partir del idUsuario
        this.medicosSrv.obtenerMedicoPorUsuario(idUsuario).subscribe({
            next: (medResp: any) => {
                console.log('📡 Respuesta obtenerMedicoPorUsuario:', medResp);
                // Buscar varias propiedades posibles que puedan contener el id_medico
                const idMedico = medResp?.id_medico || medResp?.idMedico || medResp?.id || medResp?.medicoId || 0;
                if (idMedico) {
                    this.doctorActual!.id = idMedico;
                }

                // Si la respuesta incluye especialidad, la usamos y guardamos
                const especialFromMed = medResp?.especialidad || medResp?.nombreEspecialidad || medResp?.especialidadNombre;
                    if (especialFromMed) {
                    this.doctorActual!.especialidad = especialFromMed;
                    console.log('🎯 Especialidad del doctor (desde medico):', especialFromMed);
                    // Ya tenemos id_medico (si vino) y especialidad; cargar citas
                    this.cargarCitas();
                    return;
                }

                // Si no vino especialidad, solicitarla por id_medico (si está disponible)
                if (this.doctorActual!.id) {
                    this.medicosSrv.obtenerEspecialidadPorMedico(this.doctorActual!.id).subscribe({
                        next: (espResp) => {
                            const nombre = espResp?.nombreEspecialidad || '';
                            this.doctorActual!.especialidad = nombre;
                            console.log('🎯 Especialidad del doctor (backend):', nombre);
                            this.cargarCitas();
                        },
                        error: (err) => {
                            console.error('Error obteniendo especialidad del médico:', err);
                            // Intentar cargar citas incluso si no obtuvimos especialidad
                            this.cargarCitas();
                        }
                    });
                } else {
                    console.warn('No se encontró id_medico en la respuesta de obtenerMedicoPorUsuario; cargando citas sin id_medico');
                    this.cargarCitas();
                }
            },
            error: (err) => {
                console.error('Error obteniendo medico por usuario:', err);
                // Intentar cargar citas aunque no hayamos resuelto id_medico
                this.cargarCitas();
            }
        });
    }

    // 📅 Cargar citas dinámicas (backend/localStorage) con fallback a ejemplo
    private cargarCitas(): void {
    if (!this.doctorActual) return;

    // 1️⃣ llamar al backend usando el id del médico logueado
    const idMedico = this.doctorActual.id;

    this.citasSrv.obtenerCitasDashboardPorMedico(idMedico)
        .subscribe({
            next: (data) => {
                console.log("📡 Citas desde backend:", data);

                // 2️⃣ mapear tu API → modelo Cita
                this.citasOriginales = data.map((cita, idx) => this.mapCitaBackend(cita, idx + 1));

                // 3️⃣ recalcular estadísticas
                this.calcularEstadisticas();

                // 4️⃣ aplicar filtros y paginación
                this.filtrarCitas();
            },
                error: (err) => {
                console.error("❌ Error cargando citas:", err);
                alert("No se pudieron cargar las citas del backend");

                // En caso de error dejamos la lista vacía (no usar ejemplos hardcodeados)
                this.citasOriginales = [];
                this.calcularEstadisticas();
                this.filtrarCitas();
            }
        });
}

private mapCitaBackend(c: any, idx: number): Cita {
    // Preferir el id que venga del backend; usar varios alias posibles
    const backendId = c?.id || c?.idCita || c?.id_cita || c?.citaId || idx;

    // Extraer nombre/documento/telefono del paciente teniendo en cuenta varias formas
    let pacienteNombre = '';
    let pacienteDocumento = c?.documento || null;
    let pacienteTelefono = c?.telefono || null;
    let pacienteId = null as any;

    if (typeof c?.paciente === 'string') {
        pacienteNombre = c.paciente;
    } else if (c?.paciente) {
        const p = c.paciente;
        pacienteId = p?.id || p?.idPaciente || null;
        if (p?.persona) {
            const per = p.persona;
            pacienteNombre = `${per.nombre1 || ''} ${per.nombre2 || ''} ${per.apellidoPaterno || ''} ${per.apellidoMaterno || ''}`.trim();
            pacienteDocumento = per?.dni || pacienteDocumento;
            pacienteTelefono = per?.telefono || pacienteTelefono;
        } else {
            pacienteNombre = p?.nombre || p?.nombres || pacienteNombre;
            pacienteDocumento = p?.documento || pacienteDocumento;
            pacienteTelefono = p?.telefono || pacienteTelefono;
        }
    }

    return {
        id: Number(backendId),
        fecha: c.fecha,
        hora: c.hora,
        paciente: {
            id: pacienteId || Number(backendId) || idx,
            nombre: pacienteNombre || '',
            documento: pacienteDocumento || '',
            telefono: pacienteTelefono || '',
            email: c?.paciente?.email || c?.email || ''
        },
        tipoConsulta: c.tipoConsulta,
        especialidad: this.doctorActual?.especialidad || '',
        motivo: c.tipoConsulta,
        estado: (c.estado || '').toString().toLowerCase(), // programada | completada | cancelada
        duracionEstimada: 30
    };
}


    // 🎯 Filtrar citas por especialidad del doctor
    private filtrarCitasPorDoctorOEspecialidad(citas: Cita[]): Cita[] {
        if (!this.doctorActual) return citas;
        const nombreDoctor = `${this.doctorActual.nombre} ${this.doctorActual.apellidoPaterno || ''}`.trim().toLowerCase();
        const esp = (this.doctorActual.especialidad || '').toLowerCase();
        return citas.filter(c => {
            const byEsp = esp ? (c.especialidad || '').toLowerCase() === esp : false;
            const byNombre = (c as any).doctorNombre ? ((c as any).doctorNombre as string).toLowerCase() === nombreDoctor : false;
            return byEsp || byNombre;
        });
    }

    // 📊 Calcular estadísticas
    private calcularEstadisticas(): void {
        const fechaHoy = this.obtenerFechaHoy();
        const citasHoyArray = this.citasOriginales.filter(cita => cita.fecha === fechaHoy);

        this.citasHoy = citasHoyArray.length;
        this.citasPendientes = this.citasOriginales.filter(cita => cita.estado === 'programada').length;
        this.citasCompletadas = this.citasOriginales.filter(cita => cita.estado === 'completada').length;

        this.tiempoEstimadoHoy = citasHoyArray.reduce((total, cita) =>
            total + cita.duracionEstimada, 0) / 60; // Convertir a horas

        // Encontrar próxima cita
        const citasProgramadas = this.citasOriginales
            .filter(cita => cita.estado === 'programada')
            .sort((a, b) => new Date(a.fecha + ' ' + a.hora).getTime() - new Date(b.fecha + ' ' + b.hora).getTime());

        this.proximaCita = citasProgramadas.length > 0 ? citasProgramadas[0] : null;
    }

    // 🔍 Filtrar citas
    filtrarCitas(): void {
        this.citasFiltradas = this.citasOriginales.filter(cita => {
            const cumpleFecha = !this.filtroFecha || cita.fecha === this.filtroFecha;
            const cumpleEstado = !this.filtroEstado || cita.estado === this.filtroEstado;
            const cumpleBusqueda = !this.busquedaPaciente ||
                cita.paciente.nombre.toLowerCase().includes(this.busquedaPaciente.toLowerCase()) ||
                cita.paciente.documento.includes(this.busquedaPaciente);

            return cumpleFecha && cumpleEstado && cumpleBusqueda;
        });

        // Resetear a la primera página cuando se filtran los datos
        this.paginaActual = 1;
        this.citasVisibles = [];
        this.hayMasRegistros = true;
        this.aplicarPaginacion();
    }

    // 🧹 Limpiar filtros
    limpiarFiltros(): void {
        this.filtroFecha = this.obtenerFechaHoy();
        this.filtroEstado = '';
        this.busquedaPaciente = '';
        this.filtrarCitas();
    }

    // 📝 Obtener texto descriptivo del filtro
    obtenerTextoFiltro(): string {
        if (this.filtroFecha === this.obtenerFechaHoy()) {
            return 'de Hoy';
        } else if (this.filtroFecha) {
            return `del ${new Date(this.filtroFecha).toLocaleDateString()}`;
        }

        // Si hay doctor con especialidad, mostrar eso en lugar de "Todas"
        if (this.doctorActual?.especialidad) {
            return `de ${this.doctorActual.especialidad}`;
        }

        return 'Disponibles';
    }

    // ⚡ Acciones de citas
    iniciarConsulta(cita: any): void {
        console.log('Iniciando consulta:', cita);
        const nombre = this.getPacienteNombre(cita);
        alert(`Iniciando consulta con ${nombre}`);
    }

    reprogramarCita(cita: any): void {
        console.log('Reprogramando cita:', cita);
        const nombre = this.getPacienteNombre(cita);
        alert(`Reprogramar cita de ${nombre}`);
    }

    solicitarCancelacion(cita: any): void {
        const nombre = this.getPacienteNombre(cita);
        const id = (cita && (cita.id || cita.idCita)) || 0;
        if (confirm(`¿Está seguro de solicitar la cancelación de la cita de ${nombre}?\n\nEsta solicitud será enviada al administrador para su aprobación.`)) {
            // Marcar como solicitud pendiente
            this.solicitudesCancelacion.set(id, true);

            // Simular envío al backend
            console.log('Solicitud de cancelación enviada:', {
                citaId: id,
                doctorId: 'doctor-actual', // En app real vendría del AuthService
                paciente: nombre,
                fecha: cita.fecha || cita.fechaCita,
                hora: cita.hora || cita.horaCita,
                motivo: cita.motivo || cita.motivoConsulta || '',
                timestamp: new Date().toISOString()
            });

            alert(`Solicitud de cancelación enviada al administrador.\n\nRecibirá una notificación cuando sea procesada.`);
        }
    }

    // Verificar si una cita tiene solicitud de cancelación pendiente
    tieneSolicitudCancelacion(citaId: number): boolean {
        return this.solicitudesCancelacion.get(citaId) || false;
    }

    verHistorial(cita: Cita): void {
        console.log('Navegar a sección Pacientes para ver historial de:', cita);
        const idPaciente = this.resolvePacienteIdFrom(cita) || (cita && (cita.paciente?.id || (cita as any).paciente?.idPaciente)) || null;
        if (!idPaciente) {
            console.warn('No se pudo resolver id de paciente desde la cita:', cita);
            alert('No se pudo abrir la sección Pacientes: id de paciente no encontrado.');
            return;
        }

        // Navegar a la sección de pacientes dentro del panel de médico.
        // Se pasa `pacienteId` en queryParams para facilitar que la vista Pacientes lo seleccione si se implementa.
        try {
            const pacienteName = this.getPacienteNombre(cita) || (cita && (cita.paciente?.nombre || (cita as any).paciente?.nombre)) || '';
            this.router.navigate(['/medico/pacientes'], { queryParams: { pacienteId: Number(idPaciente), pacienteName } });
        } catch (e) {
            console.error('Error navegando a /medico/pacientes:', e);
            alert('No se pudo navegar a la sección Pacientes. Revisa la consola.');
        }
    }

    // Abrir modal inline para crear historial con contexto de cita/medico/paciente
    abrirCrearHistorialModal(pacienteId: number | null, citaId: number | null, medicoId: number | null): void {
        // Asegurar que los ids sean números (no objetos vacíos)
        this.crearHistorialForm.idPaciente = pacienteId != null ? Number(pacienteId) : null;
        this.crearHistorialForm.idCita = citaId != null ? Number(citaId) : null;
        this.crearHistorialForm.idMedico = medicoId != null ? Number(medicoId) : null;
        this.crearHistorialForm.diagnostico = '';
        this.crearHistorialForm.observaciones = '';
        this.crearHistorialForm.receta = '';
        // Default a fecha/horario ahora (ISO local compatible con datetime-local)
        const now = new Date();
        const tzOffset = now.getTimezoneOffset() * 60000;
        const localISO = new Date(now.getTime() - tzOffset).toISOString().slice(0,16);
        this.crearHistorialForm.fecha = localISO;
        this.crearHistorialError = null;
        this.crearHistorialVisible = true;
        console.log('Abrir crearHistorial modal con ids:', { idPaciente: this.crearHistorialForm.idPaciente, idCita: this.crearHistorialForm.idCita, idMedico: this.crearHistorialForm.idMedico });
    }

    // Helpers para extraer ids desde diferentes shapes de la API
    resolvePacienteIdFrom(obj: any): number | null {
        if (!obj) return null;
        // intentos comunes
        const candidates = [
            obj.idPaciente, obj.id_paciente, obj.pacienteId, obj.id, // top-level
            obj.paciente?.idPaciente, obj.paciente?.id, obj.paciente?.id_paciente,
            obj.paciente?.persona?.idPersona, obj.paciente?.persona?.id
        ];
        for (const c of candidates) {
            if (c != null && c !== '' && typeof c !== 'object' && !isNaN(Number(c))) return Number(c);
        }
        return null;
    }

    resolveCitaIdFrom(obj: any): number | null {
        if (!obj) return null;
        const candidates = [obj.id, obj.idCita, obj.id_cita, obj.citaId];
        for (const c of candidates) {
            if (c != null && c !== '' && typeof c !== 'object' && !isNaN(Number(c))) return Number(c);
        }
        return null;
    }

    private resolveMedicoIdFrom(detalle: any): number | null {
        if (!detalle) return null;
        // varias formas posibles
        const candidates = [
            detalle.idMedico, detalle.id_medico, detalle.medicoId, detalle.id,
            detalle.detalleCita?.medicoEspecialidad?.medico?.id,
            detalle.detalleCita?.medicoEspecialidad?.idMedico,
            detalle.detalleCita?.medicoEspecialidad?.medico?.idMedico,
            detalle.medico?.id, detalle.medico?.idMedico
        ];
        for (const c of candidates) {
            if (c != null && c !== '' && typeof c !== 'object' && !isNaN(Number(c))) return Number(c);
        }
        return null;
    }

    // Wrapper usado por el modal de detalles para confirmar y cambiar estado
    confirmAndChange(obj: any, nuevoEstado: string): void {
        if (!obj) return;
        // Para cancelar pedimos confirmación
        if (nuevoEstado === 'cancelada') {
            const nombre = this.getPacienteNombre(obj);
            if (!confirm(`¿Confirma marcar la cita de ${nombre} como CANCELADA?`)) return;
        }

        // Resolver id robustamente
        const resolvedId = this.resolveCitaIdFrom(obj) || (obj && (obj.id || obj.idCita)) || null;
        const id = resolvedId != null ? Number(resolvedId) : NaN;
        if (isNaN(id) || id <= 0) {
            console.warn('ID inválido al cambiar estado desde modal:', { obj, resolvedId });
            alert('No se pudo cambiar el estado: id inválido. Revisa la consola.');
            return;
        }

        const estadoAnterior = (obj as any).estado || null;
        if (!nuevoEstado || nuevoEstado === estadoAnterior) return;

        this.updatingEstado.set(id, true);
        this.citasSrv.actualizarEstadoCita(id, nuevoEstado).subscribe({
            next: (res) => {
                console.log('Estado actualizado (modal):', { id, nuevoEstado, res });
                // Actualizar detalle si corresponde
                if (this.detalleCita && (this.resolveCitaIdFrom(this.detalleCita) === id || (this.detalleCita as any).id === id)) {
                    try { (this.detalleCita as any).estado = nuevoEstado; } catch (e) { /* ignore */ }
                }
                // Actualizar lista local
                const found = this.citasOriginales.find(c => (this.resolveCitaIdFrom(c) === id) || c.id === id);
                if (found) found.estado = nuevoEstado as any;

                this.updatingEstado.delete(id);
                this.calcularEstadisticas();
                this.filtrarCitas();
            },
            error: (err) => {
                console.error('Error actualizando estado (modal):', err);
                alert('No se pudo actualizar el estado. Intente nuevamente.');
                // Revertir cambios locales
                if (this.detalleCita && (this.resolveCitaIdFrom(this.detalleCita) === id || (this.detalleCita as any).id === id)) {
                    try { (this.detalleCita as any).estado = estadoAnterior; } catch (e) { /* ignore */ }
                }
                const found2 = this.citasOriginales.find(c => (this.resolveCitaIdFrom(c) === id) || c.id === id);
                if (found2) found2.estado = estadoAnterior as any;
                this.updatingEstado.delete(id);
            }
        });
    }

    // Handler usado por el select en cada fila de la tabla
    onChangeEstado(cita: Cita, nuevoEstado: string): void {
        if (!cita) return;
        const previo = cita.estado;
        if (!nuevoEstado || nuevoEstado === previo) return;

        // Si es cancelación pedir confirmación
        if (nuevoEstado === 'cancelada') {
            const nombre = this.getPacienteNombre(cita);
            if (!confirm(`¿Confirma marcar la cita de ${nombre} como CANCELADA?`)) {
                // revertir el modelo a su estado anterior en el próximo tick
                setTimeout(() => { try { cita.estado = previo as any; } catch (e) { /* ignore */ } }, 0);
                return;
            }
        }

        this.cambiarEstado(cita, nuevoEstado);
    }

    // Cambiar estado de la cita usando el servicio (reutilizable desde selects y botones)
    cambiarEstado(cita: any, nuevoEstado: string): void {
        if (!cita) return;
        const resolvedId = this.resolveCitaIdFrom(cita as any) || (cita as any).id || (cita as any).idCita || null;
        const id = resolvedId != null ? Number(resolvedId) : NaN;
        const estadoAnterior = (cita && (cita.estado)) || null;
        console.log('cambiarEstado invoked:', { cita, resolvedId, id, nuevoEstado, estadoAnterior });

        if (isNaN(id) || id <= 0) {
            console.warn('ID de cita inválido al intentar actualizar estado:', { resolvedId, cita });
            alert('No se pudo actualizar el estado de la cita: id inválido. Verifique la consola para más detalles.');
            return;
        }

        if (!nuevoEstado || nuevoEstado === estadoAnterior) return;

        this.updatingEstado.set(id, true);
        this.citasSrv.actualizarEstadoCita(id, nuevoEstado).subscribe({
            next: (res) => {
                console.log('Estado actualizado en backend:', { id, nuevoEstado, res });
                // Actualizar localmente y recalcular stats
                try { cita.estado = nuevoEstado; } catch (e) { /* ignore */ }
                // Actualizar en listado
                const found = this.citasOriginales.find(c => (this.resolveCitaIdFrom(c) === id) || c.id === id);
                if (found) found.estado = nuevoEstado as any;
                this.updatingEstado.delete(id);
                this.calcularEstadisticas();
                this.filtrarCitas();
            },
            error: (err) => {
                console.error('Error actualizando estado de la cita:', err);
                // revertir en UI
                try { cita.estado = estadoAnterior; } catch (e) { /* ignore */ }
                const found2 = this.citasOriginales.find(c => (this.resolveCitaIdFrom(c) === id) || c.id === id);
                if (found2) found2.estado = estadoAnterior as any;
                this.updatingEstado.delete(id);
                alert('No se pudo actualizar el estado de la cita. Intente nuevamente.');
            }
        });
    }

    // Handler usado por el select dentro del modal de detalle
    onChangeEstadoModal(nuevoEstado: string): void {
        if (!this.detalleCita) return;
        if (!nuevoEstado || nuevoEstado === (this.detalleCita as any).estado) return;
        // confirmAndChange ya incluye confirmación para 'cancelada'
        this.confirmAndChange(this.detalleCita, nuevoEstado);
    }

    // Indica si la fila está actualizando el estado
    isUpdatingEstado(idCita: number | null | undefined): boolean {
        if (!idCita) return false;
        return !!this.updatingEstado.get(Number(idCita));
    }

    cancelarCrearHistorial(): void {
        this.crearHistorialVisible = false;
        this.crearHistorialLoading = false;
        this.crearHistorialError = null;
    }

    enviarCrearHistorial(): void {
        if (this.crearHistorialLoading) return;
        // Debug: mostrar el estado actual del formulario antes de normalizar
        console.log('DEBUG crearHistorialForm raw:', this.crearHistorialForm);
        console.log('DEBUG tipos:', {
            idPaciente_type: typeof this.crearHistorialForm.idPaciente,
            idCita_type: typeof this.crearHistorialForm.idCita,
            idMedico_type: typeof this.crearHistorialForm.idMedico,
            fecha_type: typeof this.crearHistorialForm.fecha
        });
        // Normalizar ids a número cuando sea posible
        const idPacienteNum = this.crearHistorialForm.idPaciente != null ? Number(this.crearHistorialForm.idPaciente) : null;
        const idCitaNum = this.crearHistorialForm.idCita != null ? Number(this.crearHistorialForm.idCita) : null;
        const idMedicoNum = this.crearHistorialForm.idMedico != null ? Number(this.crearHistorialForm.idMedico) : null;

        // Validación mínima local antes de enviar
        if (!idPacienteNum || !idCitaNum || !idMedicoNum) {
            this.crearHistorialError = 'Faltan identificadores (paciente/cita/medico). No se puede crear el historial.';
            return;
        }

        // Procesar fecha: convertir la entrada de datetime-local a formato sin zona
        let fechaProcesada: string | undefined = undefined;
        if (this.crearHistorialForm.fecha) {
            const raw = String(this.crearHistorialForm.fecha);
            // Si viene con segundos, mantenerlos; si viene sin segundos (YYYY-MM-DDTHH:mm), añadir :00
            const match = raw.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(:?\d{2})?$/);
            if (match) {
                fechaProcesada = match[2] ? `${match[1]}${match[2]}` : `${match[1]}:00`;
            } else {
                // Fallback: tomar la porción inicial y formatear
                try {
                    const parts = raw.split('T');
                    if (parts.length >= 2) {
                        const timePart = parts[1].slice(0,8); // HH:MM:SS
                        fechaProcesada = `${parts[0]}T${timePart}`;
                    } else {
                        // no es válido, dejar undefined para usar default del servidor
                        fechaProcesada = undefined;
                    }
                } catch (e) {
                    fechaProcesada = undefined;
                }
            }
        }

        const payload: any = {
            idPaciente: idPacienteNum,
            idCita: idCitaNum,
            idMedico: idMedicoNum,
            diagnostico: this.crearHistorialForm.diagnostico || '',
            observaciones: this.crearHistorialForm.observaciones || '',
            receta: this.crearHistorialForm.receta || ''
        };

        if (fechaProcesada) {
            payload.fecha = fechaProcesada; // formato: YYYY-MM-DDTHH:MM:SS (sin zona)
        }

        console.log('Fecha procesada para enviar:', fechaProcesada);

        console.log('Enviando payload crearHistorial:', payload, 'payload(json):', JSON.stringify(payload));

        this.crearHistorialLoading = true;
        this.historialSrv.crearHistorial(payload).subscribe({
            next: (res) => {
                this.crearHistorialLoading = false;
                this.crearHistorialVisible = false;
                alert('Historial médico creado correctamente.');
            },
            error: (err) => {
                console.error('Error creando historial:', err);
                try { console.error('Error detalle (err.error):', err.error); } catch(e) { /* ignore */ }
                this.crearHistorialLoading = false;
                // Mostrar mensaje detallado si el backend devuelve objeto de error
                if (err && err.error) {
                    try {
                        const serverMsg = typeof err.error === 'string' ? err.error : (err.error.message || JSON.stringify(err.error));
                        this.crearHistorialError = `Servidor: ${serverMsg}`;
                    } catch (e) {
                        this.crearHistorialError = 'No se pudo crear el historial. Error del servidor.';
                    }
                } else {
                    this.crearHistorialError = 'No se pudo crear el historial. Intente nuevamente.';
                }
            }
        });
    }

    verDetalles(cita: Cita): void {
        if (!cita.id) return;

        this.citasSrv.obtenerCitaPorIdFull(cita.id).subscribe({
            next: (data: CitaCompletaFull) => {
                console.log('Detalles completos de la cita:', data);
                this.detalleCita = data;
                // Inicializar el select del modal con el estado actual
                try { this.modalSelectedEstado = (data as any).estado || ''; } catch(e) { this.modalSelectedEstado = ''; }
                this.computePacienteInfo();
                this.computeMedicoInfo();
                this.mostrarModal = true;
                // Bloquear scroll del body para que el modal gestione el desplazamiento
                try { document.body.style.overflow = 'hidden'; } catch (e) { /* ignore */ }
            },
            error: (err) => {
                console.error('Error al obtener detalles completos:', err);
                alert('No se pudieron cargar los detalles de la cita.');
            }
        });
    }

    toggleRawDetalle(): void {
        this.showRawDetalle = !this.showRawDetalle;
    }

    toggleActions(): void {
        this.showActions = !this.showActions;
    }

    // Nota: el cierre por overlay fue deshabilitado; solo el botón X cierra la modal.

    calcularEdad(fechaNacimiento?: string | null): string {
        if (!fechaNacimiento) return '-';
        try {
            const today = new Date();
            const dob = new Date(fechaNacimiento);
            let edad = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                edad--;
            }
            return String(edad);
        } catch (e) {
            return '-';
        }
    }

    formatDireccion(p: any | undefined): string {
        if (!p) return null as any;
        const parts: string[] = [];
        if (p.direccion) parts.push(p.direccion);
        if (p.distrito) parts.push(p.distrito);
        if (p.provincia) parts.push(p.provincia);
        if (p.departamento) parts.push(p.departamento);
        return parts.join(', ') || null as any;
    }
    cerrarModal(): void {
        this.mostrarModal = false;
        this.detalleCita = null;
        // Restaurar scroll del body
        try { document.body.style.overflow = ''; } catch (e) { /* ignore */ }
    }

    // computePacienteInfo y computeMedicoInfo usan this.detalleCita
    computePacienteInfo() {
        if (!this.detalleCita) { this.pacienteInfo = null; return; }
        const p = this.detalleCita.paciente;
        const persona = p?.persona;
        this.pacienteInfo = {
            nombre: persona ? `${persona.nombre1 || ''} ${persona.nombre2 || ''} ${persona.apellidoPaterno || ''} ${persona.apellidoMaterno || ''}`.trim() : '',
            dni: persona?.dni || persona?.idPersona || null,
            edad: persona?.fechaNacimiento ? this.calcularEdad(persona.fechaNacimiento) : null,
            telefono: persona?.telefono || null,
            email: persona?.email || p?.email || null,
            direccion: this.formatDireccion(persona),
            tipoSangre: (persona as any)?.tipoSangre || null,
            peso: (persona as any)?.peso || null,
            altura: (persona as any)?.altura || null,
            contactoEmergenciaNombre: p?.contactoEmergenciaNombre || (p as any)?.contactoEmergencia?.nombre || null,
            contactoEmergenciaRelacion: p?.contactoEmergenciaRelacion || (p as any)?.contactoEmergencia?.relacion || null,
            contactoEmergenciaTelefono: p?.contactoEmergenciaTelefono || (p as any)?.contactoEmergencia?.telefono || null,
            registradoPor: p?.usuarioAgrego?.correo || p?.usuarioAgrego?.persona?.nombre1 || null
        };
    }

    computeMedicoInfo() {
        if (!this.detalleCita) { this.medicoInfo = null; return; }
        const det = this.detalleCita.detalleCita;
        const me = det?.medicoEspecialidad;
        const sub = det?.subEspecialidad;
        const medico = me?.medico;
        const mp = medico?.persona;
        this.medicoInfo = {
            nombre: mp ? `${mp.nombre1 || ''} ${mp.nombre2 || ''} ${mp.apellidoPaterno || ''} ${mp.apellidoMaterno || ''}`.trim() : null,
            colegiatura: medico?.colegiatura || null,
            experiencia: (medico as any)?.experiencia || medico?.experienciaAnios || null,
            especialidad: me?.especialidad?.nombre || sub?.especialidad?.nombre || null,
            subespecialidad: sub?.nombre || me?.especialidad?.nombre || null,
            precioSubespecial: sub?.precioSubespecial || det?.precioConsulta || null
        };
    }

    // Formatea cualquier campo para mostrar un valor por defecto cuando está vacío
    display(value: any, unit?: string): string {
        if (value === null || value === undefined || value === '') return 'No encontrado';
        if (Array.isArray(value) && value.length === 0) return 'No encontrado';
        // Para objetos simples, intentar mostrar una propiedad importante o JSON reducido
        if (typeof value === 'object') {
            // si tiene nombre, devolverlo
            if ((value as any).nombre) return String((value as any).nombre);
            try { return JSON.stringify(value); } catch { return 'No encontrado'; }
        }
        const s = String(value);
        return unit ? `${s} ${unit}` : s;
    }

    // Helpers para detectar valores faltantes (usados por la plantilla)
    isMissing(value: any): boolean {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') {
            const t = value.trim();
            return t === '' || t === '-' || t.toLowerCase() === 'n/a';
        }
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') {
            if (!value) return true;
            return Object.keys(value).length === 0;
        }
        return false;
    }

    isMissingContacto(p: any): boolean {
        if (!p) return true;
        const nombre = p.contactoEmergenciaNombre || (p as any)?.contactoEmergencia?.nombre || null;
        const relacion = p.contactoEmergenciaRelacion || (p as any)?.contactoEmergencia?.relacion || null;
        const telefono = p.contactoEmergenciaTelefono || (p as any)?.contactoEmergencia?.telefono || null;
        return this.isMissing(nombre) && this.isMissing(relacion) && this.isMissing(telefono);
    }

    formatContacto(p: any): string {
        if (!p) return 'No encontrado';
        const nombre = p.contactoEmergenciaNombre || (p as any)?.contactoEmergencia?.nombre || null;
        const relacion = p.contactoEmergenciaRelacion || (p as any)?.contactoEmergencia?.relacion || null;
        const telefono = p.contactoEmergenciaTelefono || (p as any)?.contactoEmergencia?.telefono || null;
        if (!nombre && !relacion && !telefono) return 'No encontrado';
        const parts: string[] = [];
        if (nombre) parts.push(String(nombre));
        if (relacion) parts.push(`(${relacion})`);
        if (telefono) parts.push(`• ${telefono}`);
        return parts.join(' ');
    }

    // Helpers para mostrar datos en el modal
    getEstadoLabel(estado: string | null | undefined): string {
        if (!estado) return 'Desconocido';
        const e = estado.toString();
        switch (e.toLowerCase()) {
            case 'programada': return 'Programada';
            case 'completada': return 'Completada';
            case 'cancelada': return 'Cancelada';
            case 'no-show': return 'No Show';
            default: return estado;
        }
    }

    getBadgeClass(estado: string | null | undefined): string {
        if (!estado) return 'badge-unknown';
        return `badge-${estado.toString().toLowerCase()}`;
    }

    // Abrir el modal inline para crear un historial (usa el contexto de la cita ya cargada)
    registrarHistorial(): void {
        if (!this.detalleCita) {
            alert('No hay una cita seleccionada para registrar el historial.');
            return;
        }

        // Resolver ids robustamente desde el objeto detalleCita
        const citaId = this.resolveCitaIdFrom(this.detalleCita) || (this.detalleCita as any).id || (this.detalleCita as any).idCita || null;
        const pacienteId = this.resolvePacienteIdFrom(this.detalleCita) || (this.detalleCita as any).paciente?.id || null;
        const medicoId = this.resolveMedicoIdFrom(this.detalleCita) || this.doctorActual?.id || (this.medicoInfo && (this.medicoInfo as any).id) || null;

        // Abrir modal con ids ya normalizados
        this.abrirCrearHistorialModal(pacienteId, citaId, medicoId);
    }

    formatDateTime(fecha: string | undefined, hora?: string | undefined): string {
        if (!fecha) return '';
        try {
            const d = new Date(fecha + (hora ? ('T' + hora) : 'T00:00:00'));
            const opciones: any = { dateStyle: 'medium' };
            if (hora) opciones.timeStyle = 'short';
            return d.toLocaleString('es-ES', opciones);
        } catch (e) {
            return fecha + (hora ? (' ' + hora) : '');
        }
    }

    getPacienteNombre(cita: any | null): string {
        if (!cita) return '';
        const p = cita.paciente?.persona || cita.paciente;
        if (!p) return '';
        const parts: string[] = [];
        if (p.nombre1) parts.push(p.nombre1);
        if (p.nombre2) parts.push(p.nombre2);
        if (p.apellidoPaterno) parts.push(p.apellidoPaterno);
        if (p.apellidoMaterno) parts.push(p.apellidoMaterno);
        if (parts.length === 0 && typeof cita.paciente === 'string') return cita.paciente;
        return parts.join(' ').trim();
    }



    // 🗓️ Utilidades de fecha
    private obtenerFechaHoy(): string {
        return new Date().toISOString().split('T')[0];
    }

    formatearFecha(fecha: string): string {
        const fechaObj = new Date(fecha + 'T00:00:00');
        const opciones: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        };
        return fechaObj.toLocaleDateString('es-ES', opciones);
    }

    // 🔁 Mapping helpers y dataset de ejemplo
    // Removed example generator and legacy mapper — component uses backend mapping (mapCitaBackend)

    // 📊 Métodos de paginación híbrida
    aplicarPaginacion(): void {
        this.totalRegistros = this.citasFiltradas.length;
        // Calcular páginas basado en registrosPorPagina normal (no multiplicado)
        this.totalPaginas = Math.ceil(this.totalRegistros / this.registrosPorPagina);

        // Cargar primer lote de la página actual
        this.cargarLoteDePagina();
    }

    private cargarLoteDePagina(): void {
        const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
        let fin = inicio + Math.floor(this.registrosPorPagina / this.lotesPorPagina); // Cargar solo parte inicial

        // Si es menos de 5 registros por página, mostrar todos
        if (this.registrosPorPagina <= 5) {
            fin = inicio + this.registrosPorPagina;
        }

        this.citasVisibles = this.citasFiltradas.slice(inicio, fin);
        this.citasPaginadas = this.citasVisibles; // Para compatibilidad

        this.registrosIniciales = this.totalRegistros > 0 ? inicio + 1 : 0;
        this.registrosFinales = Math.min(fin, this.totalRegistros);

        // Verificar si hay más registros en esta página para cargar
        const maxEnPagina = inicio + this.registrosPorPagina;
        this.hayMasRegistros = fin < Math.min(maxEnPagina, this.totalRegistros) && this.registrosPorPagina > 5;
    }

    irAPagina(pagina: number): void {
        if (pagina >= 1 && pagina <= this.totalPaginas) {
            this.paginaActual = pagina;
            this.citasVisibles = [];
            this.hayMasRegistros = true;
            this.aplicarPaginacion();
        }
    }

    paginaAnterior(): void {
        this.irAPagina(this.paginaActual - 1);
    }

    paginaSiguiente(): void {
        this.irAPagina(this.paginaActual + 1);
    }

    cambiarRegistrosPorPagina(cantidad: number): void {
        this.registrosPorPagina = cantidad;
        this.paginaActual = 1;
        this.aplicarPaginacion();
    }

    obtenerNumerosPagina(): number[] {
        const paginas = [];
        const inicio = Math.max(1, this.paginaActual - 2);
        const fin = Math.min(this.totalPaginas, this.paginaActual + 2);

        for (let i = inicio; i <= fin; i++) {
            paginas.push(i);
        }

        return paginas;
    }

    // 🔄 Cargar más registros (por lotes)
    cargarMasRegistros(): void {
        if (this.cargandoMas || !this.hayMasRegistros) return;

        this.cargandoMas = true;

        // Simular delay de carga
        setTimeout(() => {
            const inicioPagina = (this.paginaActual - 1) * this.registrosPorPagina;
            const inicioNuevoLote = inicioPagina + this.citasVisibles.length;
            const loteSize = Math.floor(this.registrosPorPagina / this.lotesPorPagina);
            const finNuevoLote = Math.min(inicioNuevoLote + loteSize, inicioPagina + this.registrosPorPagina);

            const nuevoLote = this.citasFiltradas.slice(inicioNuevoLote, finNuevoLote);
            this.citasVisibles = [...this.citasVisibles, ...nuevoLote];
            this.citasPaginadas = this.citasVisibles; // Para compatibilidad

            this.registrosFinales = Math.min(inicioNuevoLote + nuevoLote.length, this.totalRegistros);

            // Verificar si hay más registros en esta página
            const maxEnPagina = inicioPagina + this.registrosPorPagina;
            this.hayMasRegistros = finNuevoLote < maxEnPagina && finNuevoLote < this.totalRegistros;

            this.cargandoMas = false;
        }, 500);
    }
}
