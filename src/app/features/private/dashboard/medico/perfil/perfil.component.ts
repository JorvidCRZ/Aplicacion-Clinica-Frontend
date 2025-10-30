import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth/auth.service';
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

  // 📊 Estadísticas del doctor
  estadisticas: EstadisticaDoctor = {
    totalPacientes: 127,
    citasAtendidas: 1240,
    calificacionPromedio: 4.8,
    añosExperiencia: 8,
    especialidades: ['Medicina General', 'Cardiología']
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarUsuarioLogueado();
    this.inicializarHorarios();
    // Sobrescribir horarios por los configurados en la pantalla de Horarios (si existen)
    this.cargarHorariosDesdeStorage();
    this.cargarDatosDoctor();
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
    this.cargarDatosDoctor();
  }

  // 👨‍⚕️ Cargar datos específicos para doctor
  private cargarDatosDoctor(): void {
    console.log('🏥 Iniciando carga de datos del doctor...');
    
    const usuarioCompleto = this.usuarioLogueado as any;
    
    console.log('📊 Datos del usuario para doctor:', {
      especialidad: localStorage.getItem(`medico_especialidad:${usuarioCompleto.correo}`),
      nroColegiado: localStorage.getItem(`medico_colegiatura:${usuarioCompleto.correo}`),
      rol: usuarioCompleto.rol?.nombre
    });
    
    // Intentar leer especialidad/colegiatura almacenadas para el médico
    const espLS = localStorage.getItem(`medico_especialidad:${usuarioCompleto.correo}`);
    this.doctor.especialidad = espLS || 'Medicina General';
    if (!espLS) console.log('⚠️ Usando especialidad por defecto: Medicina General');
    
  const cmpLS = localStorage.getItem(`medico_colegiatura:${usuarioCompleto.correo}`);
  this.doctor.numeroRegistro = cmpLS || this.generarNumeroRegistro();
  if (!cmpLS) console.log('⚠️ Generando número de registro:', this.doctor.numeroRegistro);
    
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
    this.editando = true;
  }

  // 💾 Guardar cambios
  async guardarCambios(): Promise<void> {
    this.guardando = true;
    
    try {
      // Simular guardado
      await this.simularGuardado();
      
      console.log('Datos del doctor guardados:', this.doctor);
      alert('✅ Perfil actualizado exitosamente');
      
      this.editando = false;
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('❌ Error al guardar el perfil. Inténtalo de nuevo.');
    } finally {
      this.guardando = false;
    }
  }

  // ❌ Cancelar edición
  cancelarEdicion(): void {
    if (confirm('¿Estás seguro de cancelar los cambios?')) {
      this.editando = false;
      this.cargarDatosDoctor(); // Recargar datos originales
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
