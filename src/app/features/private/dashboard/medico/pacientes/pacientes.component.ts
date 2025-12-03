import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicosService } from '../../../../../core/services/logic/medico.service';
import { PacienteService } from '../../../../../core/services/rol/paciente.service';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { CitaService } from '../../../../../core/services/logic/cita.service';
import { HistorialMedicoService } from '../../../../../core/services/logic/historial-medico.service';
import { ActivatedRoute } from '@angular/router';
import { HistorialMedico } from '../../../../../core/models/common/historial-medico';

// 👤 Interfaces para gestión de pacientes
interface Paciente {
  id: number;
  nombre: string;
  documento: string;
  edad: number;
  genero: 'masculino' | 'femenino' | 'otro';
  telefono: string;
  email: string;
  ultimaCita: string;
  ultimoDiagnostico: string;
  fechaRegistro: string;
}

interface EstadisticasPacientes {
  porEdad: { [key: string]: number };
  porGenero: { masculino: number; femenino: number; otro: number };
  diagnosticosFrecuentes: { nombre: string; cantidad: number }[];
}

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css'
})
export class PacientesComponent implements OnInit {

  // 📊 Datos de pacientes
  pacientesOriginales: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];

  // 🎛️ Filtros y búsqueda
  busquedaTexto = '';
  filtroEdad = '';
  ordenamiento = 'nombre';
  vistaActual: 'tarjetas' | 'tabla' = 'tabla'; // Tabla por defecto para eficiencia

  // 📈 Estadísticas
  totalPacientes = 0;
  totalCitas = 0;
  citasEsteMes = 0;
  
  estadisticas: EstadisticasPacientes = {
    porEdad: {},
    porGenero: { masculino: 0, femenino: 0, otro: 0 },
    diagnosticosFrecuentes: []
  };

  // Variables para manejar query params entrantes desde otras vistas
  private pendingQueryPacienteId: number | null = null;
  private pendingQueryPacienteName: string | null = null;

  constructor(
    private medicosService: MedicosService,
    private pacienteSrv: PacienteService,
    private auth: AuthService,
    private citaService: CitaService,
    private historialSrv: HistorialMedicoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Instanciar el id del médico desde el usuario logueado si está disponible
    try {
      const u: any = this.auth.currentUser;
      const possibleId = u?.idMedico ?? u?.idMedico ?? u?.id ?? u?.idUsuario ?? null;
      this.currentMedicoId = possibleId ? Number(possibleId) : null;
    } catch (e) {
      this.currentMedicoId = null;
    }

    // Escuchar query params para prefiltrar/abrir un paciente si viene desde otra vista
    this.route.queryParams.subscribe(params => {
      const rawId = params['pacienteId'] ?? params['pacienteid'] ?? null;
      const rawName = params['pacienteName'] ?? params['pacientename'] ?? params['nombre'] ?? null;
      this.pendingQueryPacienteId = rawId ? Number(rawId) : null;
      this.pendingQueryPacienteName = rawName ? String(rawName) : null;
      // Si ya cargamos pacientes, aplicar inmediatamente
      if (this.pacientesOriginales && this.pacientesOriginales.length > 0) {
        this._applyPendingQueryAfterLoad();
      }
    });

    this.cargarPacientes();
    this.calcularEstadisticas();
    this.filtrarPacientes();
  }

  // 👥 Cargar pacientes dinámicos desde las Citas, filtrados por especialidad o por el propio médico
  private cargarPacientes(): void {
    const user = this.auth.currentUser;
    console.log('PacientesComponent.cargarPacientes - currentUser:', user);
    if (!user || !user.idUsuario) {
      console.log('PacientesComponent.cargarPacientes - no user or idUsuario, abortando');
      this.pacientesOriginales = [];
      return;
    }

    // Primero obtener el idMedico real asociado al usuario
    console.log('PacientesComponent.cargarPacientes - obteniendo medico por usuario:', user.idUsuario);
    this.medicosService.obtenerMedicoPorUsuario(user.idUsuario).subscribe({
      next: (medico: any) => {
        console.log('PacientesComponent.cargarPacientes - medico obtenido:', medico);

        const idMedico = medico?.idMedico ?? medico?.id ?? null;
        // Guardar id del médico en el estado para poder usarlo al solicitar historiales por paciente+medico
        this.currentMedicoId = idMedico ?? null;
        if (!idMedico) {
          console.warn('PacientesComponent.cargarPacientes - no se encontró idMedico en la respuesta del backend para este usuario');
          this.pacientesOriginales = [];
          this.calcularEstadisticas();
          this.filtrarPacientes();
          return;
        }

        
        this.pacienteSrv.obtenerPacientesPorMedico(idMedico).subscribe({
          next: (res: any[]) => {
            console.log('PacientesComponent.cargarPacientes - respuesta API pacientes:', res);
            // Debug: log contacto fields explicitly to detect naming/availability issues
            if (res && res.length > 0) {
              console.log('Primer registro raw:', res[0]);
              res.forEach((raw: any, i: number) => {
                console.log(`raw[${i}] keys:`, Object.keys(raw));
                console.log(`raw[${i}] contacto_telefonos:`, raw.contacto_telefonos);
                console.log(`raw[${i}] contacto_email:`, raw.contacto_email);
                console.log(`raw[${i}] contacto:`, raw.contacto);
                console.log(`raw[${i}] email:`, raw.email);
              });
            }
            this.pacientesOriginales = (res || []).map((p: any, idx: number) => ({
              id: p.idPaciente ?? (idx + 1),
              nombre: p.nombreCompleto ?? p.nombre ?? '—',
              documento: p.documento ?? '',
              edad: p.edad ?? 0,
              genero: (p.genero === 'masculino' || p.genero === 'femenino') ? p.genero : 'otro',
              // Map DB view fields. Accept both snake_case (from native query) and camelCase (from DTO JSON)
              telefono:
                p.contacto_telefonos ?? p.contactoTelefonos ?? p.contacto ?? p.telefono ?? '',
              email:
                p.contacto_email ?? p.contactoEmail ?? p.email ?? p.correo ?? '',
              ultimaCita: p.ultimaCita ?? '',
              ultimoDiagnostico: p.diagnostico ?? '—',
              fechaRegistro: p.fechaRegistro ?? ''
            }));

            console.log('PacientesComponent.cargarPacientes - pacientes mapeados:', this.pacientesOriginales.length, this.pacientesOriginales);
            // Calcular estadísticas básicas por ahora
            this.calcularEstadisticas();
            this.filtrarPacientes();

            // Pedir al backend los contadores reales por médico
            this.citaService.contarCitasPorMedico(idMedico).subscribe({
              next: (total: number) => {
                console.log('PacientesComponent - total citas por medico recibido:', total);
                this.totalCitas = Number(total || 0);
              },
              error: (err: any) => console.error('Error al obtener total de citas por medico:', err)
            });

            this.citaService.contarCitasDelMesActualPorMedico(idMedico).subscribe({
              next: (mesTotal: number) => {
                console.log('PacientesComponent - total citas este mes por medico recibido:', mesTotal);
                this.citasEsteMes = Number(mesTotal || 0);
              },
              error: (err: any) => console.error('Error al obtener total de citas del mes por medico:', err)
            });
            // Si vinieron query params pendientes, aplicarlos ahora que la lista se cargó
            if (this.pendingQueryPacienteId || this.pendingQueryPacienteName) {
              this._applyPendingQueryAfterLoad();
            }
          },
          error: (err: any) => {
            console.error('Error al obtener pacientes por médico:', err);
            this.pacientesOriginales = [];
            this.calcularEstadisticas();
            this.filtrarPacientes();
          }
        });
      },
      error: (err: any) => {
        console.error('PacientesComponent.cargarPacientes - error obteniendo medico por usuario:', err);
        this.pacientesOriginales = [];
        this.calcularEstadisticas();
        this.filtrarPacientes();
      }
    });
  }

  private _applyPendingQueryAfterLoad(): void {
    // Si viene nombre desde query params, ponerlo en el buscador y filtrar
    if (this.pendingQueryPacienteName) {
      this.busquedaTexto = String(this.pendingQueryPacienteName);
      this.pendingQueryPacienteName = null;
      this.filtrarPacientes();
      return;
    }

    // Si viene id, intentar resolver en la lista cargada
    if (this.pendingQueryPacienteId) {
      const id = Number(this.pendingQueryPacienteId);
      const found = this.pacientesOriginales.find(p => Number(p.id) === id);
      if (found) {
        this.busquedaTexto = found.nombre || '';
        this.pendingQueryPacienteId = null;
        this.filtrarPacientes();
        return;
      }

      // Si no se encuentra localmente, solicitar al backend y usar el nombre para filtrar
      this.pacienteSrv.getById(id).subscribe({
        next: (raw: any) => {
          try {
            const nombre = raw?.nombreCompleto ?? raw?.nombre ?? (raw?.persona ? `${raw.persona?.nombre1 || ''} ${raw.persona?.apellidoPaterno || ''}`.trim() : '');
            if (nombre) {
              this.busquedaTexto = nombre;
              // No es necesario agregar a la lista, basta filtrar por nombre
              this.filtrarPacientes();
            }
          } catch (e) {
            console.error('Error mapeando paciente desde getById:', e);
          }
          this.pendingQueryPacienteId = null;
        },
        error: (err: any) => {
          console.error('Error obteniendo paciente por id desde queryParams:', err);
          this.pendingQueryPacienteId = null;
        }
      });
    }
  }

  // 📊 Calcular estadísticas
  private calcularEstadisticas(): void {
  this.totalPacientes = this.pacientesOriginales.length;
  // Evitar la simulación que multiplicaba por 3. Mientras el backend responde, usar un valor conservador.
  this.totalCitas = this.pacientesOriginales.length;
    this.citasEsteMes = this.pacientesOriginales.filter(p => 
      new Date(p.ultimaCita).getMonth() === new Date().getMonth()
    ).length;

    // Estadísticas por edad
    this.estadisticas.porEdad = {
      '0-17': this.pacientesOriginales.filter(p => p.edad <= 17).length,
      '18-39': this.pacientesOriginales.filter(p => p.edad >= 18 && p.edad <= 39).length,
      '40-64': this.pacientesOriginales.filter(p => p.edad >= 40 && p.edad <= 64).length,
      '65+': this.pacientesOriginales.filter(p => p.edad >= 65).length
    };

    // Estadísticas por género
    this.estadisticas.porGenero = {
      masculino: this.pacientesOriginales.filter(p => p.genero === 'masculino').length,
      femenino: this.pacientesOriginales.filter(p => p.genero === 'femenino').length,
      otro: this.pacientesOriginales.filter(p => p.genero === 'otro').length
    };

    // Diagnósticos frecuentes
    const diagnosticos: { [key: string]: number } = {};
    this.pacientesOriginales.forEach(p => {
      diagnosticos[p.ultimoDiagnostico] = (diagnosticos[p.ultimoDiagnostico] || 0) + 1;
    });

    this.estadisticas.diagnosticosFrecuentes = Object.entries(diagnosticos)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }

  // 🔍 Filtrar pacientes
  filtrarPacientes(): void {
    this.pacientesFiltrados = this.pacientesOriginales.filter(paciente => {
      const cumpleTexto = !this.busquedaTexto || 
        paciente.nombre.toLowerCase().includes(this.busquedaTexto.toLowerCase()) ||
        paciente.documento.includes(this.busquedaTexto) ||
        paciente.telefono.includes(this.busquedaTexto);

      const cumpleEdad = !this.filtroEdad || this.verificarRangoEdad(paciente.edad, this.filtroEdad);

      return cumpleTexto && cumpleEdad;
    });

    this.aplicarOrdenamiento();
  }

  // 🎯 Verificar rango de edad
  private verificarRangoEdad(edad: number, rango: string): boolean {
    switch (rango) {
      case '0-17': return edad <= 17;
      case '18-39': return edad >= 18 && edad <= 39;
      case '40-64': return edad >= 40 && edad <= 64;
      case '65+': return edad >= 65;
      default: return true;
    }
  }

  // 📊 Aplicar ordenamiento
  aplicarOrdenamiento(): void {
    this.pacientesFiltrados.sort((a, b) => {
      switch (this.ordenamiento) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'nombre-desc':
          return b.nombre.localeCompare(a.nombre);
        case 'fecha-desc':
          return new Date(b.ultimaCita).getTime() - new Date(a.ultimaCita).getTime();
        case 'fecha-asc':
          return new Date(a.ultimaCita).getTime() - new Date(b.ultimaCita).getTime();
        case 'edad-asc':
          return a.edad - b.edad;
        case 'edad-desc':
          return b.edad - a.edad;
        default:
          return 0;
      }
    });
  }

  // 🧹 Limpiar filtros
  limpiarFiltros(): void {
    this.busquedaTexto = '';
    this.filtroEdad = '';
    this.ordenamiento = 'nombre';
    this.filtrarPacientes();
  }

  // 👁️ Cambiar vista
  cambiarVista(vista: 'tarjetas' | 'tabla'): void {
    this.vistaActual = vista;
  }

  // ⚡ Acciones de pacientes
  // Variables para modal de historial
  mostrarModalHistorial = false;
  historiales: HistorialMedico[] = [];
  historialLoading = false;
  historialError: string | null = null;
  pacienteSeleccionado: Paciente | null = null;
  // id del médico logueado (usado para filtrar historiales por paciente+medico)
  currentMedicoId: number | null = null;

  verHistorial(paciente: Paciente): void {
    console.log('Ver historial de:', paciente.nombre, 'id=', paciente.id);
    this.pacienteSeleccionado = paciente;
    this.mostrarModalHistorial = true;
    this.historialLoading = true;
    this.historialError = null;
    // Bloquear scroll del body mientras el modal esté abierto
    try { document.body.classList.add('modal-open'); } catch (e) {}
    const idPacienteNum = Number(paciente.id);
    // Forzar uso del endpoint paciente+medico con el id del médico obtenido del login
    if (!this.currentMedicoId || Number(this.currentMedicoId) <= 0) {
      console.warn('No se encontró id de médico en la sesión. No se puede cargar historiales filtrados por médico.');
      this.historialError = 'No se encontró el id del médico en la sesión.';
      this.historialLoading = false;
      return;
    }

    this.historialSrv.getHistorialPorPacienteYMedico(idPacienteNum, Number(this.currentMedicoId)).subscribe({
      next: (res: HistorialMedico[]) => {
        this.historiales = res || [];
        this.historialLoading = false;
      },
      error: (err: any) => {
        console.error('Error al obtener historiales del paciente (paciente+medico):', err);
        this.historialError = 'Error al obtener historiales. Intente de nuevo.';
        this.historialLoading = false;
      }
    });
  }

  cerrarModalHistorial(): void {
    this.mostrarModalHistorial = false;
    this.historiales = [];
    this.historialLoading = false;
    this.historialError = null;
    this.pacienteSeleccionado = null;
    try { document.body.classList.remove('modal-open'); } catch (e) {}
  }

  // Formateadores simples para la vista del modal
  formatFecha(fecha?: string | null): string {
    if (!fecha) return 'No encontrado';
    try {
      const d = new Date(fecha);
      if (isNaN(d.getTime())) return fecha;
      return d.toLocaleString();
    } catch {
      return fecha;
    }
  }

  // Estado de expansión para cada tarjeta de historial
  expandedHistorial = new Set<number>();

  toggleHistorialDetalle(id?: number | null): void {
    if (!id) return;
    if (this.expandedHistorial.has(id)) {
      this.expandedHistorial.delete(id);
    } else {
      this.expandedHistorial.add(id);
    }
  }

  isHistorialExpandido(id?: number | null): boolean {
    if (!id) return false;
    return this.expandedHistorial.has(id);
  }

  // Navegación interna del modal: detalle como 'página'
  selectedHistorial: HistorialMedico | null = null;

  openHistorialDetalle(id?: number | null): void {
    if (!id) return;
    const found = this.historiales.find(h => (h.idHistorial ?? -1) === id);
    if (found) {
      this.selectedHistorial = found;
      // opcional: limpiar scroll de modal-body al cambiar
      setTimeout(() => {
        const mb = document.querySelector('.modal-body');
        if (mb) { (mb as HTMLElement).scrollTop = 0; }
      }, 50);
    }
  }

  volverALaLista(): void {
    this.selectedHistorial = null;
    // volver al tope de la lista
    setTimeout(() => {
      const mb = document.querySelector('.modal-body');
      if (mb) { (mb as HTMLElement).scrollTop = 0; }
    }, 50);
  }

  // Helpers para mostrar nombres
  formatPersonaNombre(persona: any): string {
    if (!persona) return 'No encontrado';
    const a = (persona.nombre1 || '') as string;
    const b = (persona.apellidoPaterno || '') as string;
    const c = (persona.apellidoMaterno || '') as string;
    const parts = [a, b, c].map(s => (s || '').trim()).filter(Boolean);
    return parts.length ? parts.join(' ') : 'No encontrado';
  }

  /** Devuelve un color (hex) para la subespecialidad / especialidad. */
  getEspecialidadAccent(hist: HistorialMedico): string {
    const name = (hist?.cita?.detalleCita?.subEspecialidad?.nombre || hist?.cita?.detalleCita?.medicoEspecialidad?.especialidad?.nombre || '').toString().toLowerCase();
    if (!name) return '#06b6d4'; // fallback cyan suave

    // Mapeo ampliado por palabras clave (puedes ajustar o añadir nombres completos)
    if (name.includes('cardio') || name.includes('cardi')) return '#2563eb'; // azul (cardiología) — cambiado a azul
    if (name.includes('pediatr') || name.includes('niño') || name.includes('pedi')) return '#06b6d4'; // cyan (pediatría)
    if (name.includes('neuro')) return '#7c3aed'; // morado (neurología)
    if (name.includes('ginec') || name.includes('gineco')) return '#f59e0b'; // naranja (gineco)
    if (name.includes('derma') || name.includes('piel')) return '#059669'; // verde oscuro (dermatología)
    if (name.includes('oftalm') || name.includes('ojo')) return '#f97316'; // naranja-rojizo (oftalmología)
    if (name.includes('traumat') || name.includes('ortop')) return '#8b5cf6'; // violeta suave (trauma/ortopedia)
    if (name.includes('endocr') || name.includes('diabet')) return '#06b6d4'; // cyan (endocrino)
    if (name.includes('psiqu') || name.includes('mental')) return '#f472b6'; // rosa (psiquiatría)
    if (name.includes('odont') || name.includes('dental')) return '#10b981'; // verde (odontología)
    if (name.includes('electro') || name.includes('ekg') || name.includes('ecg')) return '#2563eb'; // azul (EKG)
    if (name.includes('general') || name.includes('medicina')) return '#64748b'; // gris-azulado (general)

    // Fallback: paleta viva por defecto
    return '#2563eb';
  }

  // --- Editar historial ---
  editingHistorial = false;
  editLoading = false;
  editError: string | null = null;
  showSaveConfirm = false;
  // form model
  editForm: {
    fecha: string; // yyyy-MM-dd
    diagnostico: string;
    observaciones: string;
    receta: string;
  } = { fecha: '', diagnostico: '', observaciones: '', receta: '' };

  startEditHistorial(): void {
    if (!this.selectedHistorial) return;
    // inicializar form con valores actuales
    const f = this.selectedHistorial.fecha ? this.selectedHistorial.fecha.split('T')[0] : '';
    this.editForm = {
      fecha: f,
      diagnostico: this.selectedHistorial.diagnostico || '',
      observaciones: this.selectedHistorial.observaciones || '',
      receta: this.selectedHistorial.receta || ''
    };
    this.editError = null;
    this.editingHistorial = true;
    // asegurar scroll al inicio del panel
    setTimeout(() => { const mb = document.querySelector('.modal-body'); if (mb) (mb as HTMLElement).scrollTop = 0; }, 50);
  }

  cancelEditHistorial(): void {
    this.editingHistorial = false;
    this.editError = null;
  }

  // Mostrar diálogo de confirmación antes de guardar
  confirmSaveRequest(): void {
    this.showSaveConfirm = true;
  }

  cancelConfirmSave(): void {
    this.showSaveConfirm = false;
  }

  confirmSaveHistorial(): void {
    this.showSaveConfirm = false;
    this.saveEditHistorial();
  }

  saveEditHistorial(): void {
    if (!this.selectedHistorial) return;
    const idHist = Number(this.selectedHistorial.idHistorial ?? -1);
    if (idHist <= 0) { this.editError = 'Id inválido'; return; }
    this.editLoading = true;
    this.editError = null;

    // Preparar payload parcial (el servicio acepta Partial<HistorialMedicoCreate>)
    const payload: Partial<any> = {
      fecha: this.editForm.fecha ? (this.editForm.fecha.includes('T') ? this.editForm.fecha : `${this.editForm.fecha}T00:00:00`) : null,
      diagnostico: this.editForm.diagnostico || null,
      observaciones: this.editForm.observaciones || null,
      receta: this.editForm.receta || null,
    };

    this.historialSrv.actualizarHistorial(idHist, payload).subscribe({
      next: (updated) => {
        // actualizar la lista y la vista actual con la respuesta
        this.historiales = this.historiales.map(h => ((h.idHistorial ?? -1) === (updated.idHistorial ?? -1) ? updated : h));
        this.selectedHistorial = updated;
        this.editLoading = false;
        this.editingHistorial = false;
      },
      error: (err) => {
        console.error('Error al actualizar historial:', err);
        this.editError = 'No se pudo actualizar. Intente de nuevo.';
        this.editLoading = false;
      }
    });
  }

  // --- Prevención de scroll chaining (fallback) ---
  private _touchStartY = 0;

  onModalWheel(event: WheelEvent): void {
    const el = event.currentTarget as HTMLElement | null;
    if (!el) { event.stopPropagation(); return; }
    // Determinar si el elemento puede hacer scroll en la dirección del wheel
    const delta = event.deltaY;
    const scrollTop = el.scrollTop;
    const atTop = scrollTop <= 0;
    const atBottom = Math.abs(el.scrollHeight - el.clientHeight - scrollTop) <= 1;

    // Si está en tope y se intenta scrollear hacia afuera, evitar que la página padre reciba el evento
    if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Permitir scroll dentro del modal pero impedir que burbujee
    event.stopPropagation();
  }

  onModalTouchStart(event: TouchEvent): void {
    if (event.touches && event.touches.length > 0) {
      this._touchStartY = event.touches[0].clientY;
    }
  }

  onModalTouchMove(event: TouchEvent): void {
    const el = event.currentTarget as HTMLElement | null;
    if (!el) { event.stopPropagation(); return; }
    if (!event.touches || event.touches.length === 0) { return; }
    const currentY = event.touches[0].clientY;
    const delta = this._touchStartY - currentY;
    const scrollTop = el.scrollTop;
    const atTop = scrollTop <= 0;
    const atBottom = Math.abs(el.scrollHeight - el.clientHeight - scrollTop) <= 1;

    if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    event.stopPropagation();
  }

  nuevaCita(paciente: Paciente): void {
    console.log('Nueva cita para:', paciente.nombre);
    // Aquí abrirías el formulario de nueva cita
  }

  contactarPaciente(paciente: Paciente): void {
    console.log('Contactar a:', paciente.nombre);
    // Preparar datos y abrir modal de contacto
    const telefonoRaw = (paciente.telefono || '').toString();
    const telefonoDigits = telefonoRaw.replace(/\D/g, '');
    this.contactName = paciente.nombre || '';
    this.contactNumber = telefonoRaw || '';
    this._contactDigits = telefonoDigits;
    this.contactEmail = (paciente.email || '') as string;
    this.contactCopied = false;
    this.contactModalVisible = true;
  }

  // Contact modal state
  contactModalVisible = false;
  contactNumber: string = '';
  contactName: string = '';
  contactEmail: string = '';
  contactCopied = false;
  private _contactDigits: string = '';

  // Actions
  llamarContacto(): void {
    if (!this._contactDigits) return;
    const telHref = `tel:${this._formatTelHref(this._contactDigits)}`;
    window.location.href = telHref;
  }

  abrirWhatsApp(): void {
    if (!this._contactDigits) return;
    const waNum = this._contactDigits.replace(/^\+/, '');
    const text = encodeURIComponent(`Hola ${this.contactName || ''}, quería contactarle desde la clínica.`);
    const url = `https://wa.me/${waNum}?text=${text}`;
    window.open(url, '_blank');
  }

  async copiarNumero(): Promise<void> {
    try {
      const toCopy = this.contactNumber || this._contactDigits;
      await navigator.clipboard.writeText(toCopy);
      this.contactCopied = true;
      setTimeout(() => this.contactCopied = false, 2200);
    } catch (e) {
      console.error('Error copiando número:', e);
      this.contactCopied = false;
    }
  }

  cerrarContactModal(): void {
    this.contactModalVisible = false;
  }

  private _formatTelHref(digits: string): string {
    // Prepend + if seems to have country code else leave as is
    if (!digits) return '';
    // If digits length >= 10 assume includes country code
    if (digits.length >= 10 && digits[0] !== '+') return `+${digits}`;
    return digits;
  }
}





