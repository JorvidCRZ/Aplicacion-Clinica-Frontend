import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { MedicosService } from '../../../../../core/services/logic/medico.service';
import { Usuario } from '../../../../../core/models/users/usuario';

// 👨‍⚕️ Interfaces para perfil del doctor
interface DoctorPerfil {
  id: number;
  nombre: string;
  apellidos: string;
  especialidad: string;
  numeroRegistro: string;
  cedula: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
  genero: 'masculino' | 'femenino' | 'otro';
  direccion: string;
  biografia: string;
  experiencia: number;
  horarioAtencion: HorarioAtencion[];
  tarifa: number;
}

interface HorarioAtencion {
  dia: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
}

interface EstadisticaDoctor {
  totalPacientes: number;
  citasAtendidas: number;
  calificacionPromedio: number;
  añosExperiencia: number;
  especialidades: string[];
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {

  // 👨‍⚕️ Usuario logueado
  usuarioLogueado: Usuario | null = null;
  
  // 📋 Datos del doctor
  doctor: DoctorPerfil = {
    id: 1,
    nombre: '',
    apellidos: '',
    especialidad: 'Medicina General',
    numeroRegistro: '',
    cedula: '',
    telefono: '',
    email: '',
    fechaNacimiento: '',
    genero: 'masculino',
    direccion: '',
    biografia: '',
    experiencia: 0,
    horarioAtencion: [],
    tarifa: 0
  };

  // 🎛️ Estados del componente
  editando = false;
  seccionActiva = 'informacion';
  guardando = false;
  // respaldo para restaurar al cancelar edición
  private backupDoctor: DoctorPerfil | null = null;
  // Modales personalizados
  showConfirmCancel = false;
  showResultModal = false;
  resultModalMessage = '';
  resultModalType: 'success' | 'error' = 'success';
  private resultTimeout: any = null;
  private resultFadeTimeout: any = null;
  resultFading = false;

  private abrirResultModal(message: string, type: 'success' | 'error' = 'success') {
    const TOTAL_MS = 2000; // visible total time
    const FADE_MS = 400; // duración del fade
    const FADE_START = Math.max(0, TOTAL_MS - FADE_MS);

    this.resultModalMessage = message;
    this.resultModalType = type;
    this.resultFading = false;
    this.showResultModal = true;

    // limpiar timeouts previos si existen
    if (this.resultTimeout) {
      clearTimeout(this.resultTimeout);
      this.resultTimeout = null;
    }
    if (this.resultFadeTimeout) {
      clearTimeout(this.resultFadeTimeout);
      this.resultFadeTimeout = null;
    }

    // iniciar fade antes de ocultar completamente
    this.resultFadeTimeout = setTimeout(() => {
      this.resultFading = true;
    }, FADE_START);

    // ocultar completamente después del total configurado
    this.resultTimeout = setTimeout(() => {
      this.showResultModal = false;
      this.resultFading = false;
      this.resultTimeout = null;
      if (this.resultFadeTimeout) {
        clearTimeout(this.resultFadeTimeout);
        this.resultFadeTimeout = null;
      }
    }, TOTAL_MS);
  }

  // 📊 Estadísticas del doctor
  estadisticas: EstadisticaDoctor = {
    totalPacientes: 127,
    citasAtendidas: 1240,
    calificacionPromedio: 4.8,
    añosExperiencia: 8,
    especialidades: ['Medicina General', 'Cardiología']
  };

  constructor(private authService: AuthService, private medicosService: MedicosService) {}

  ngOnInit(): void {
    this.cargarUsuarioLogueado();
    this.inicializarHorarios();
    // Sobrescribir horarios por los configurados en la pantalla de Horarios (si existen)
    this.cargarHorariosDesdeStorage();
  }

  // 👤 Cargar usuario logueado
  cargarUsuarioLogueado(): void {
    this.usuarioLogueado = this.authService.currentUser;
    
    if (!this.usuarioLogueado) {
      console.error('No hay usuario logueado');
      return;
    }

    console.log('🔍 Usuario logueado completo:', this.usuarioLogueado);
    console.log('📋 Rol:', this.usuarioLogueado.rol?.nombre);

    // Cargar datos básicos del usuario
    const p = this.usuarioLogueado.persona as any;
    this.doctor.id = this.usuarioLogueado.idUsuario || 0;
    this.doctor.nombre = p?.nombre1 || '';
    this.doctor.email = this.usuarioLogueado.correo || '';
    this.doctor.telefono = p?.telefono || '';
    this.doctor.cedula = p?.dni || '';
    
    // Construir apellidos completos
    const apellidos = [p?.apellidoPaterno, p?.apellidoMaterno]
      .filter((apellido: string) => apellido && apellido.trim())
      .join(' ');
    this.doctor.apellidos = apellidos;
    
    // Datos personales del usuario
    this.doctor.genero = (p?.genero as any) || 'masculino';
    this.doctor.fechaNacimiento = p?.fechaNacimiento ?
      new Date(p.fechaNacimiento).toISOString().split('T')[0] : '';
    
    // Construir dirección completa
    this.doctor.direccion = this.construirDireccion();

    // Este perfil es exclusivo para médicos: cargar directamente datos del doctor
    // Intentaremos resolver el registro médico (id_medico) y perfil desde el backend
    const idUsuario = this.usuarioLogueado.idUsuario || 0;
    if (!idUsuario) {
      console.warn('No idUsuario disponible en currentUser; usando datos del usuario y valores por defecto');
      this.cargarDatosDoctor();
      return;
    }

    this.medicosService.obtenerMedicoPorUsuario(idUsuario).subscribe({
      next: (medResp: any) => {
        console.log('📡 Respuesta obtenerMedicoPorUsuario (perfil componente):', medResp);
        const idMedico = medResp?.id_medico || medResp?.idMedico || medResp?.id || medResp?.medicoId || 0;
        if (idMedico) {
          this.doctor.id = idMedico;
        }

        // Si la llamada devolvió ya datos relevantes (especialidad/colegiatura), los aplicamos
        if (medResp?.especialidad) this.doctor.especialidad = medResp.especialidad;
        if (medResp?.colegiatura) this.doctor.numeroRegistro = medResp.colegiatura;

        // Si tenemos idMedico, solicitar perfil detallado
        if (this.doctor.id) {
          this.medicosService.obtenerPerfilMedico(this.doctor.id).subscribe({
            next: (perfilResp: any) => {
              const perfil = Array.isArray(perfilResp) ? perfilResp[0] : perfilResp || {};
              // Mapear campos del backend al modelo local
              const n1 = perfil?.nombre1 || '';
              const n2 = perfil?.nombre2 || '';
              const nombreComp = [n1, n2].filter(Boolean).join(' ');
              if (nombreComp) this.doctor.nombre = nombreComp;

              const apellidos = [perfil?.apellidoPaterno, perfil?.apellidoMaterno].filter(Boolean).join(' ');
              if (apellidos) this.doctor.apellidos = apellidos;

              this.doctor.cedula = perfil?.dni || this.doctor.cedula;
              this.doctor.fechaNacimiento = perfil?.fechaNacimiento ? new Date(perfil.fechaNacimiento).toISOString().split('T')[0] : this.doctor.fechaNacimiento;
              const gen = perfil?.genero;
              if (gen === 'femenino' || gen === 'masculino' || gen === 'otro') {
                this.doctor.genero = gen as any;
              }
              this.doctor.telefono = perfil?.telefono || this.doctor.telefono;
              this.doctor.direccion = perfil?.direccion || this.construirDireccion() || this.doctor.direccion;
              this.doctor.email = perfil?.correo || this.doctor.email;
              this.doctor.especialidad = perfil?.especialidad || this.doctor.especialidad;
              this.doctor.numeroRegistro = perfil?.colegiatura || this.doctor.numeroRegistro || this.generarNumeroRegistro();

              this.cargarDatosDoctor();
            },
            error: (err) => {
              console.error('Error obteniendo perfil del médico:', err);
              // Aunque falle la petición del perfil, continuamos con datos que tengamos
              this.cargarDatosDoctor();
            }
          });
        } else {
          // No hay id_medico: continuar con datos del usuario
          this.cargarDatosDoctor();
        }
      },
      error: (err) => {
        console.error('Error obteniendo medico por usuario:', err);
        this.cargarDatosDoctor();
      }
    });
  }

  // 👨‍⚕️ Cargar datos específicos para doctor
  private cargarDatosDoctor(): void {
    console.log('🏥 Iniciando carga de datos del doctor...');
    
    const usuarioCompleto = this.usuarioLogueado as any;
    
    console.log('📊 Datos del usuario para doctor:', {
      especialidadBackend: this.doctor.especialidad,
      nroColegiadoBackend: this.doctor.numeroRegistro,
      rol: usuarioCompleto.rol?.nombre
    });

    // Usar valores traídos desde backend (si existen), si no aplicar valores por defecto
    this.doctor.especialidad = this.doctor.especialidad || 'Medicina General';
    if (!this.doctor.especialidad) console.log('⚠️ Usando especialidad por defecto: Medicina General');

    this.doctor.numeroRegistro = this.doctor.numeroRegistro || this.generarNumeroRegistro();
    
    this.doctor.experiencia = this.calcularExperienciaPorEdad();
    this.doctor.tarifa = 150; // Tarifa base
    this.doctor.biografia = `Médico especialista en ${this.doctor.especialidad}. Profesional con experiencia en atención médica de calidad.`;
    
    // Actualizar estadísticas basadas en el usuario
    this.estadisticas = {
      totalPacientes: Math.floor(Math.random() * 200) + 50,
      citasAtendidas: Math.floor(Math.random() * 1500) + 500,
      calificacionPromedio: 4.5 + Math.random() * 0.5,
      añosExperiencia: this.doctor.experiencia,
      especialidades: [this.doctor.especialidad]
    };

    console.log('🎯 Datos finales del doctor cargados:', {
      nombre: this.doctor.nombre,
      apellidos: this.doctor.apellidos,
      especialidad: this.doctor.especialidad,
      registro: this.doctor.numeroRegistro,
      experiencia: this.doctor.experiencia
    });
  }

  // 🏠 Construir dirección completa
  private construirDireccion(): string {
    if (!this.usuarioLogueado) return '';
    
    const p = this.usuarioLogueado.persona as any;
    const direccion = [p?.direccion, p?.distrito, p?.provincia, p?.departamento, p?.pais]
      .filter((parte: string) => parte)
      .join(', ');
    
    return direccion;
  }

  // 🕐 Inicializar horarios por defecto
  private inicializarHorarios(): void {
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    this.doctor.horarioAtencion = diasSemana.map(dia => ({
      dia,
      horaInicio: '08:00',
      horaFin: '17:00',
      disponible: dia !== 'Domingo' // Domingo por defecto no disponible
    }));
  }

  // 🔄 Cargar horarios guardados por el médico desde la pantalla de Horarios
  private cargarHorariosDesdeStorage(): void {
    try {
      const correo = this.usuarioLogueado?.correo || '';
      const key = correo ? `horarios_doctor:${correo}` : `horarios_doctor_id:${this.usuarioLogueado?.idUsuario || 0}`;
      const raw = localStorage.getItem(key);
      if (!raw) return; // no hay horarios guardados

      const diasSemana: Array<{ id: number; nombre: string; activo: boolean; horarios: Array<{ horaInicio: string; horaFin: string; tipo: string }> }> = JSON.parse(raw);

      // Mapear a un resumen por día (ventana [minInicio, maxFin] de bloques que no son 'descanso')
      const resumen: HorarioAtencion[] = diasSemana.map(d => {
        const activos = (d.horarios || []).filter(h => h && h.tipo !== 'descanso');
        if (!d.activo || activos.length === 0) {
          return { dia: d.nombre, horaInicio: '—', horaFin: '—', disponible: false } as HorarioAtencion;
        }
        const minInicio = activos.reduce((min, h) => (h.horaInicio < min ? h.horaInicio : min), activos[0].horaInicio);
        const maxFin = activos.reduce((max, h) => (h.horaFin > max ? h.horaFin : max), activos[0].horaFin);
        return { dia: d.nombre, horaInicio: minInicio, horaFin: maxFin, disponible: true } as HorarioAtencion;
      });

      // Alinear con el orden usado en inicializarHorarios
      const orden = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
      this.doctor.horarioAtencion = resumen.sort((a, b) => orden.indexOf(a.dia) - orden.indexOf(b.dia));
    } catch (e) {
      console.warn('No se pudieron cargar los horarios desde storage:', e);
    }
  }

  // 📋 Cargar datos específicos del doctor (eliminar duplicado y usar el nuevo)
  // Este método ahora está integrado en verificarRolYCargarDatos()

  // 🔢 Generar número de registro basado en rol y ID
  private generarNumeroRegistro(): string {
    if (!this.usuarioLogueado) return 'REG-00000';
    // Perfil exclusivo de médicos: siempre prefijo CMP
    return `CMP-${(this.usuarioLogueado.idUsuario || 0).toString().padStart(5, '0')}`;
  }

  // 📅 Calcular experiencia basada en la edad del usuario
  private calcularExperienciaPorEdad(): number {
    const edad = this.edadCalculada;
    if (edad >= 30) {
      return Math.min(edad - 24, 30); // Máximo 30 años de experiencia
    }
    return Math.max(1, edad - 24); // Mínimo 1 año
  }

  // 🔄 Cambiar sección activa
  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
  }

  // ✏️ Activar modo edición
  activarEdicion(): void {
    // guardar respaldo profundo antes de permitir edición
    this.backupDoctor = JSON.parse(JSON.stringify(this.doctor));
    this.editando = true;
  }

  // 💾 Guardar cambios
  async guardarCambios(): Promise<void> {
    if (!this.doctor.id) {
      this.abrirResultModal('No se pudo actualizar: no se encontró el id del médico.', 'error');
      return;
    }

    this.guardando = true;

    const payload = this.construirPayloadPerfil();

    this.medicosService.actualizarPerfilMedico(this.doctor.id, payload).subscribe({
      next: (resp) => {
        console.log('✅ Perfil actualizado (backend):', resp);
        // mostrar modal de éxito (auto-cierre en 3s)
        this.abrirResultModal('Perfil actualizado exitosamente', 'success');
        // limpiar respaldo y salir de edición
        this.backupDoctor = null;
        this.editando = false;
        this.guardando = false;
      },
      error: (err) => {
        console.error('❌ Error al actualizar perfil en backend:', err);
        this.abrirResultModal('Error al guardar el perfil. Inténtalo de nuevo.', 'error');
        this.guardando = false;
      }
    });
  }

  // ❌ Cancelar edición (abrir modal de confirmación)
  cancelarEdicion(): void {
    this.showConfirmCancel = true;
  }

  // Confirmar cancelación: restaurar datos y cerrar modal
  confirmarCancelarEdicion(): void {
    if (this.backupDoctor) {
      this.doctor = JSON.parse(JSON.stringify(this.backupDoctor));
      this.backupDoctor = null;
    } else {
      this.cargarDatosDoctor();
    }
    this.editando = false;
    this.showConfirmCancel = false;
    // mostrar modal informativo pequeño (auto-cierre)
    this.abrirResultModal('Cambios descartados', 'success');
  }

  cancelarConfirmacion(): void {
    this.showConfirmCancel = false;
  }

  // Cerrar modal de resultado
  cerrarResultModal(): void {
    this.showResultModal = false;
    this.resultFading = false;
    if (this.resultTimeout) {
      clearTimeout(this.resultTimeout);
      this.resultTimeout = null;
    }
    if (this.resultFadeTimeout) {
      clearTimeout(this.resultFadeTimeout);
      this.resultFadeTimeout = null;
    }
  }

  // 📷 Cambiar foto de perfil
  cambiarFoto(): void {
    console.log('Cambiar foto de perfil');
    // Aquí iría la lógica para cambiar la foto
    alert('🚧 Funcionalidad de cambio de foto en desarrollo');
  }

  // 🔐 Cambiar contraseña
  cambiarContrasena(): void {
    console.log('Cambiar contraseña');
    // Aquí iría la lógica para cambiar contraseña
    alert('🚧 Funcionalidad de cambio de contraseña en desarrollo');
  }

  // 📝 Obtener texto del horario
  obtenerTextoHorario(horario: HorarioAtencion): string {
    if (!horario.disponible || !horario.horaInicio || !horario.horaFin || horario.horaInicio === '—') {
      return 'No disponible';
    }
    return `${horario.horaInicio} - ${horario.horaFin}`;
  }

  // 🎨 Obtener clase CSS del día
  obtenerClaseDia(horario: HorarioAtencion): string {
    return horario.disponible ? 'disponible' : 'no-disponible';
  }

  // ⏱️ Simular guardado (desarrollo)
  private simularGuardado(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1500);
    });
  }

  // Construir payload esperado por el backend a partir del modelo local
  private construirPayloadPerfil(): any {
    // dividir nombre en nombre1 y nombre2
    const nombres = (this.doctor.nombre || '').trim().split(/\s+/).filter(Boolean);
    const nombre1 = nombres[0] || '';
    const nombre2 = nombres.slice(1).join(' ') || '';

    // dividir apellidos en paterno/materno
    const apellidos = (this.doctor.apellidos || '').trim().split(/\s+/).filter(Boolean);
    const apellidoPaterno = apellidos[0] || '';
    const apellidoMaterno = apellidos.slice(1).join(' ') || '';

    return {
      nombre1,
      nombre2,
      apellidoPaterno,
      apellidoMaterno,
      dni: this.doctor.cedula || '',
      fechaNacimiento: this.doctor.fechaNacimiento || null,
      genero: this.doctor.genero || null,
      telefono: this.doctor.telefono || null,
      direccion: this.doctor.direccion || null,
      correo: this.doctor.email || null,
      especialidad: this.doctor.especialidad || null,
      colegiatura: this.doctor.numeroRegistro || null
    };
  }

  // 📊 Getters para datos del usuario logueado
  get nombreCompleto(): string {
    return `${this.doctor.nombre} ${this.doctor.apellidos}`.trim();
  }

  get nombreCompletoConTitulo(): string {
    return `Dr. ${this.nombreCompleto}`.trim();
  }

  get rolUsuario(): string {
    return 'doctor';
  }

  get rolFormateado(): string {
    return 'Doctor';
  }

  get iniciales(): string {
    const nombres = this.doctor.nombre.split(' ');
    const apellidos = this.doctor.apellidos.split(' ');
    const primerNombre = nombres[0]?.[0] || '';
    const primerApellido = apellidos[0]?.[0] || '';
    return (primerNombre + primerApellido).toUpperCase();
  }

  get edadCalculada(): number {
    if (!this.doctor.fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(this.doctor.fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  get direccionCompleta(): string {
    return this.doctor.direccion || 'No especificada';
  }

  get tipoDocumento(): string {
    const p = this.usuarioLogueado?.persona as any;
    return p?.tipoDocumento || 'DNI';
  }

  // 🔧 Validaciones
  get formularioValido(): boolean {
    return !!(
      this.doctor.nombre.trim() &&
      this.doctor.apellidos.trim() &&
      this.doctor.especialidad.trim() &&
      this.doctor.numeroRegistro.trim() &&
      this.doctor.telefono.trim() &&
      this.doctor.email.trim()
    );
  }

  get horariosConfigurados(): number {
    return this.doctor.horarioAtencion.filter(h => h.disponible).length;
  }

}
