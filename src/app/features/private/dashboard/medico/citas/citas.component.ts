import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { CitaService } from '../../../../../core/services/logic/cita.service';
import { CitaCompletaFull } from '../../../../../core/models/common/cita';
// import CitaCompleta removed — backend used directly
import { MedicosService } from '../../../../../core/services/logic/medico.service';




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

    detalleCita: CitaCompletaFull | null = null; // Almacena la cita completa obtenida del backend
    mostrarModal = false;            // Controla la visibilidad del modal
    showRawDetalle = false;
    showActions = false;
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
        console.log('Ver historial:', cita);
        alert(`Ver historial médico de ${cita.paciente.nombre}`);
    }

    verDetalles(cita: Cita): void {
        if (!cita.id) return;

        this.citasSrv.obtenerCitaPorIdFull(cita.id).subscribe({
            next: (data: CitaCompletaFull) => {
                console.log('Detalles completos de la cita:', data);
                this.detalleCita = data;
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
