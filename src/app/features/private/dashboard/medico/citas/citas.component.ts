import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { CitaService } from '../../../../../core/services/logic/cita.service';
import { CitaCompleta } from '../../../../../core/models/common/cita';

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
        this.cargarCitas();
        this.calcularEstadisticas();
        // No filtrar por fecha inicialmente, mostrar todas las citas
        this.filtrarCitas();
    }

    // 👨‍⚕️ Obtener doctor logueado
    private obtenerDoctorActual(): void {
        const user: any = this.authService.currentUser;
        if (!user) return;
        const p = user.persona || {};
        const correo = user.correo || '';
        const especialidadLS = localStorage.getItem(`medico_especialidad:${correo}`) || undefined;
        this.doctorActual = {
            id: user.idUsuario || 0,
            nombre: `${p.nombre1 || ''}`.trim(),
            apellidoPaterno: p.apellidoPaterno || '',
            correo,
            especialidad: especialidadLS
        };
        console.log('👨‍⚕️ Doctor actual:', this.doctorActual);
        console.log('🎯 Especialidad del doctor:', this.doctorActual.especialidad);
    }

    // 📅 Cargar citas dinámicas (backend/localStorage) con fallback a ejemplo
    private cargarCitas(): void {
            // Sembrar demo si está vacío para que todas las vistas sean coherentes
            if (this.doctorActual) {
                const nombreDoctor = `${this.doctorActual.nombre} ${this.doctorActual.apellidoPaterno || ''}`.trim();
                this.citasSrv.seedIfEmptyForDoctor(nombreDoctor, this.doctorActual.especialidad);
            }
            const citasLocal: CitaCompleta[] = this.citasSrv.obtenerCitas();
        let mapped: Cita[] = citasLocal.map((c, idx) => this.mapCita(c, idx + 1));

        // Si no hay citas guardadas localmente, generamos un pequeño dataset de ejemplo para no dejar vacío
        if (mapped.length === 0) {
            mapped = this.generarCitasEjemplo();
        }

        // 🎯 Filtrar por especialidad del doctor o por coincidencia de nombre del médico
        this.citasOriginales = this.filtrarCitasPorDoctorOEspecialidad(mapped);
        console.log('📅 Citas cargadas para el doctor:', this.citasOriginales.length);
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
    iniciarConsulta(cita: Cita): void {
        console.log('Iniciando consulta:', cita);
        // Aquí iría la lógica para iniciar la consulta
        alert(`Iniciando consulta con ${cita.paciente.nombre}`);
    }

    reprogramarCita(cita: Cita): void {
        console.log('Reprogramando cita:', cita);
        alert(`Reprogramar cita de ${cita.paciente.nombre}`);
    }

    solicitarCancelacion(cita: Cita): void {
        if (confirm(`¿Está seguro de solicitar la cancelación de la cita de ${cita.paciente.nombre}?\n\nEsta solicitud será enviada al administrador para su aprobación.`)) {
            // Marcar como solicitud pendiente
            this.solicitudesCancelacion.set(cita.id, true);

            // Simular envío al backend
            console.log('Solicitud de cancelación enviada:', {
                citaId: cita.id,
                doctorId: 'doctor-actual', // En app real vendría del AuthService
                paciente: cita.paciente.nombre,
                fecha: cita.fecha,
                hora: cita.hora,
                motivo: '', // Se podría agregar un campo para el motivo
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
        console.log('Ver detalles:', cita);
        alert(`Detalles de la cita de ${cita.paciente.nombre}`);
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
    private mapCita(c: CitaCompleta, idx: number): Cita {
        const estadoMap: Record<string, Cita['estado']> = {
            pendiente: 'programada',
            confirmada: 'programada',
            completada: 'completada',
            cancelada: 'cancelada'
        };
        return {
            id: c.id || idx,
            fecha: c.fecha,
            hora: c.hora,
            paciente: {
                id: idx,
                nombre: c.pacienteNombre,
                documento: '',
                telefono: c.pacienteTelefono,
                email: c.pacienteEmail
            },
            tipoConsulta: c.tipoConsulta,
            especialidad: c.especialidad,
            motivo: c.motivoConsulta,
            estado: estadoMap[c.estado] || 'programada',
            duracionEstimada: c.duracionEstimada || 30
        };
    }

    private generarCitasEjemplo(): Cita[] {
        const especialidades = ['Cardiología', 'Medicina General'];
        const ejemplos: Cita[] = [];
        for (let i = 1; i <= 10; i++) {
            ejemplos.push({
                id: i,
                fecha: '2025-10-01',
                hora: `${(8 + (i % 8)).toString().padStart(2, '0')}:00`,
                paciente: {
                    id: i,
                    nombre: `Paciente ${i}`,
                    documento: `${10000000 + i}`,
                    telefono: `999${(100000 + i).toString().slice(0, 6)}`,
                    email: `pac${i}@example.com`
                },
                tipoConsulta: i % 2 ? 'Control' : 'Primera Consulta',
                especialidad: especialidades[i % 2],
                motivo: 'Consulta generada como ejemplo',
                estado: i % 3 === 0 ? 'completada' : 'programada',
                duracionEstimada: 30
            });
        }
        return ejemplos;
    }

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
