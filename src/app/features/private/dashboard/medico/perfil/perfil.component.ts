// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { AuthService } from '../../../../../core/services/rol/auth.service';
// import { Usuario } from '../../../../../core/models/users/usuario';
// import { Doctor } from '../../../../../core/models/users/doctor';

// // 👨‍⚕️ Interfaces para perfil del doctor
// interface DoctorPerfil {
//   id: number;
//   nombre: string;
//   apellidos: string;
//   especialidad: string;
//   numeroRegistro: string;
//   cedula: string;
//   telefono: string;
//   email: string;
//   fechaNacimiento: string;
//   genero: 'masculino' | 'femenino' | 'otro';
//   direccion: string;
//   biografia: string;
//   experiencia: number;
//   horarioAtencion: HorarioAtencion[];
//   tarifa: number;
// }

// interface HorarioAtencion {
//   dia: string;
//   horaInicio: string;
//   horaFin: string;
//   disponible: boolean;
// }

// interface EstadisticaDoctor {
//   totalPacientes: number;
//   citasAtendidas: number;
//   calificacionPromedio: number;
//   añosExperiencia: number;
//   especialidades: string[];
// }

// @Component({
//   selector: 'app-perfil',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './perfil.component.html',
//   styleUrl: './perfil.component.css'
// })
// export class PerfilComponent implements OnInit {

//   // 👨‍⚕️ Usuario logueado
//   usuarioLogueado: Usuario | Doctor | null = null;
  
//   // 📋 Datos del doctor
//   doctor: DoctorPerfil = {
//     id: 1,
//     nombre: '',
//     apellidos: '',
//     especialidad: 'Medicina General',
//     numeroRegistro: '',
//     cedula: '',
//     telefono: '',
//     email: '',
//     fechaNacimiento: '',
//     genero: 'masculino',
//     direccion: '',
//     biografia: '',
//     experiencia: 0,
//     horarioAtencion: [],
//     tarifa: 0
//   };

//   // 🎛️ Estados del componente
//   editando = false;
//   seccionActiva = 'informacion';
//   guardando = false;

//   // 📊 Estadísticas del doctor
//   estadisticas: EstadisticaDoctor = {
//     totalPacientes: 127,
//     citasAtendidas: 1240,
//     calificacionPromedio: 4.8,
//     añosExperiencia: 8,
//     especialidades: ['Medicina General', 'Cardiología']
//   };

//   constructor(private authService: AuthService) {}

//   ngOnInit(): void {
//     this.cargarUsuarioLogueado();
//     this.inicializarHorarios();
//     this.cargarDatosDoctor();
//   }

//   // 👤 Cargar usuario logueado
//   cargarUsuarioLogueado(): void {
//     this.usuarioLogueado = this.authService.currentUser;
    
//     if (!this.usuarioLogueado) {
//       console.error('No hay usuario logueado');
//       return;
//     }

//     console.log('🔍 Usuario logueado completo:', this.usuarioLogueado);
//     console.log('📋 Propiedades del usuario:', Object.keys(this.usuarioLogueado));
//     console.log('🩺 ¿Tiene especialidad?:', 'especialidad' in this.usuarioLogueado, (this.usuarioLogueado as any).especialidad);
//     console.log('🏥 ¿Tiene nroColegiado?:', 'nroColegiado' in this.usuarioLogueado, (this.usuarioLogueado as any).nroColegiado);

//     // Cargar datos básicos del usuario
//     this.doctor.id = this.usuarioLogueado.id;
//     this.doctor.nombre = this.usuarioLogueado.nombre;
//     this.doctor.email = this.usuarioLogueado.email;
//     this.doctor.telefono = this.usuarioLogueado.telefono || '';
//     this.doctor.cedula = this.usuarioLogueado.numeroDocumento;
    
//     // Construir apellidos completos
//     const apellidos = [
//       this.usuarioLogueado.apellidoPaterno,
//       this.usuarioLogueado.apellidoMaterno
//     ].filter(apellido => apellido && apellido.trim()).join(' ');
//     this.doctor.apellidos = apellidos;
    
//     // Datos personales del usuario
//     this.doctor.genero = this.usuarioLogueado.genero || 'masculino';
//     this.doctor.fechaNacimiento = this.usuarioLogueado.fechaNacimiento ? 
//       new Date(this.usuarioLogueado.fechaNacimiento).toISOString().split('T')[0] : '';
    
//     // Construir dirección completa
//     this.doctor.direccion = this.construirDireccion();
    
//     // Verificar rol y cargar datos específicos
//     this.verificarRolYCargarDatos();
//   }

//   // 🔍 Verificar rol del usuario y cargar datos específicos
//   private verificarRolYCargarDatos(): void {
//     if (!this.usuarioLogueado) return;

//     console.log('🔍 Verificando rol del usuario:', this.usuarioLogueado.rol);
//     console.log('📄 Datos completos del usuario:', this.usuarioLogueado);

//     switch (this.usuarioLogueado.rol) {
//       case 'doctor':
//         console.log('👨‍⚕️ Usuario identificado como Doctor');
//         this.cargarDatosDoctor();
//         break;
        
//       case 'admin':
//         console.log('👑 Usuario identificado como Admin');
//         this.cargarDatosAdmin();
//         break;
        
//       case 'paciente':
//         console.warn('🚫 Usuario paciente intentando acceder al perfil de doctor');
//         break;
        
//       default:
//         console.warn('❓ Rol no reconocido:', (this.usuarioLogueado as any).rol);
//         this.cargarDatosPorDefecto();
//     }
//   }

//   // 👨‍⚕️ Cargar datos específicos para doctor
//   private cargarDatosDoctor(): void {
//     console.log('🏥 Iniciando carga de datos del doctor...');
    
//     // Acceder directamente a las propiedades del usuario logueado
//     const usuarioCompleto = this.usuarioLogueado as any;
    
//     console.log('📊 Datos del usuario para doctor:', {
//       especialidad: usuarioCompleto.especialidad,
//       nroColegiado: usuarioCompleto.nroColegiado,
//       rol: usuarioCompleto.rol
//     });
    
//     // Usar especialidad real del usuario o fallback
//     if (usuarioCompleto.especialidad) {
//       this.doctor.especialidad = usuarioCompleto.especialidad;
//       console.log('✅ Usando especialidad real:', usuarioCompleto.especialidad);
//     } else {
//       this.doctor.especialidad = 'Medicina General';
//       console.log('⚠️ Usando especialidad por defecto: Medicina General');
//     }
    
//     // Usar número de colegiado real o generar uno
//     if (usuarioCompleto.nroColegiado) {
//       this.doctor.numeroRegistro = usuarioCompleto.nroColegiado;
//       console.log('✅ Usando nroColegiado real:', usuarioCompleto.nroColegiado);
//     } else {
//       this.doctor.numeroRegistro = this.generarNumeroRegistro();
//       console.log('⚠️ Generando número de registro:', this.doctor.numeroRegistro);
//     }
    
//     this.doctor.experiencia = this.calcularExperienciaPorEdad();
//     this.doctor.tarifa = 150; // Tarifa base
//     this.doctor.biografia = `Médico especialista en ${this.doctor.especialidad}. Profesional con experiencia en atención médica de calidad.`;
    
//     // Actualizar estadísticas basadas en el usuario
//     this.estadisticas = {
//       totalPacientes: Math.floor(Math.random() * 200) + 50,
//       citasAtendidas: Math.floor(Math.random() * 1500) + 500,
//       calificacionPromedio: 4.5 + Math.random() * 0.5,
//       añosExperiencia: this.doctor.experiencia,
//       especialidades: [this.doctor.especialidad]
//     };

//     console.log('🎯 Datos finales del doctor cargados:', {
//       nombre: this.doctor.nombre,
//       apellidos: this.doctor.apellidos,
//       especialidad: this.doctor.especialidad,
//       registro: this.doctor.numeroRegistro,
//       experiencia: this.doctor.experiencia
//     });
//   }

//   // 👑 Cargar datos específicos para admin
//   private cargarDatosAdmin(): void {
//     this.doctor.especialidad = 'Administración Médica';
//     this.doctor.numeroRegistro = 'ADM-' + this.usuarioLogueado!.id.toString().padStart(5, '0');
//     this.doctor.experiencia = this.calcularExperienciaPorEdad();
//     this.doctor.tarifa = 0; // Admin no tiene tarifa
//     this.doctor.biografia = `Administrador del sistema clínico con experiencia en gestión hospitalaria y coordinación médica.`;
    
//     // Estadísticas para admin
//     this.estadisticas = {
//       totalPacientes: 500, // Vista general
//       citasAtendidas: 0, // Admin no atiende citas
//       calificacionPromedio: 0,
//       añosExperiencia: this.doctor.experiencia,
//       especialidades: ['Administración', 'Gestión Clínica']
//     };
//   }

//   // 🔧 Cargar datos por defecto
//   private cargarDatosPorDefecto(): void {
//     this.doctor.especialidad = 'General';
//     this.doctor.numeroRegistro = 'USR-' + this.usuarioLogueado!.id.toString().padStart(5, '0');
//     this.doctor.experiencia = 1;
//     this.doctor.tarifa = 100;
//     this.doctor.biografia = `Usuario del sistema clínico.`;
//   }

//   // 🏠 Construir dirección completa
//   private construirDireccion(): string {
//     if (!this.usuarioLogueado) return '';
    
//     const direccion = [
//       this.usuarioLogueado.domicilio,
//       this.usuarioLogueado.distrito,
//       this.usuarioLogueado.provincia,
//       this.usuarioLogueado.departamento,
//       this.usuarioLogueado.pais
//     ].filter(parte => parte).join(', ');
    
//     return direccion;
//   }

//   // 🕐 Inicializar horarios por defecto
//   private inicializarHorarios(): void {
//     const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
//     this.doctor.horarioAtencion = diasSemana.map(dia => ({
//       dia,
//       horaInicio: '08:00',
//       horaFin: '17:00',
//       disponible: dia !== 'Domingo' // Domingo por defecto no disponible
//     }));
//   }

//   // 📋 Cargar datos específicos del doctor (eliminar duplicado y usar el nuevo)
//   // Este método ahora está integrado en verificarRolYCargarDatos()

//   // 🔢 Generar número de registro basado en rol y ID
//   private generarNumeroRegistro(): string {
//     if (!this.usuarioLogueado) return 'REG-00000';
    
//     const prefijo = this.usuarioLogueado.rol === 'doctor' ? 'CMP' : 
//                    this.usuarioLogueado.rol === 'admin' ? 'ADM' : 'USR';
    
//     return `${prefijo}-${this.usuarioLogueado.id.toString().padStart(5, '0')}`;
//   }

//   // 📅 Calcular experiencia basada en la edad del usuario
//   private calcularExperienciaPorEdad(): number {
//     const edad = this.edadCalculada;
//     if (edad >= 30) {
//       return Math.min(edad - 24, 30); // Máximo 30 años de experiencia
//     }
//     return Math.max(1, edad - 24); // Mínimo 1 año
//   }

//   // 🔄 Cambiar sección activa
//   cambiarSeccion(seccion: string): void {
//     this.seccionActiva = seccion;
//   }

//   // ✏️ Activar modo edición
//   activarEdicion(): void {
//     this.editando = true;
//   }

//   // 💾 Guardar cambios
//   async guardarCambios(): Promise<void> {
//     this.guardando = true;
    
//     try {
//       // Simular guardado
//       await this.simularGuardado();
      
//       console.log('Datos del doctor guardados:', this.doctor);
//       alert('✅ Perfil actualizado exitosamente');
      
//       this.editando = false;
//     } catch (error) {
//       console.error('Error al guardar:', error);
//       alert('❌ Error al guardar el perfil. Inténtalo de nuevo.');
//     } finally {
//       this.guardando = false;
//     }
//   }

//   // ❌ Cancelar edición
//   cancelarEdicion(): void {
//     if (confirm('¿Estás seguro de cancelar los cambios?')) {
//       this.editando = false;
//       this.cargarDatosDoctor(); // Recargar datos originales
//     }
//   }

//   // 📷 Cambiar foto de perfil
//   cambiarFoto(): void {
//     console.log('Cambiar foto de perfil');
//     // Aquí iría la lógica para cambiar la foto
//     alert('🚧 Funcionalidad de cambio de foto en desarrollo');
//   }

//   // 🔐 Cambiar contraseña
//   cambiarContrasena(): void {
//     console.log('Cambiar contraseña');
//     // Aquí iría la lógica para cambiar contraseña
//     alert('🚧 Funcionalidad de cambio de contraseña en desarrollo');
//   }

//   // 📝 Obtener texto del horario
//   obtenerTextoHorario(horario: HorarioAtencion): string {
//     if (!horario.disponible) {
//       return 'No disponible';
//     }
//     return `${horario.horaInicio} - ${horario.horaFin}`;
//   }

//   // 🎨 Obtener clase CSS del día
//   obtenerClaseDia(horario: HorarioAtencion): string {
//     return horario.disponible ? 'disponible' : 'no-disponible';
//   }

//   // ⏱️ Simular guardado (desarrollo)
//   private simularGuardado(): Promise<void> {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve();
//       }, 1500);
//     });
//   }

//   // 📊 Getters para datos del usuario logueado
//   get nombreCompleto(): string {
//     return `${this.doctor.nombre} ${this.doctor.apellidos}`.trim();
//   }

//   get nombreCompletoConTitulo(): string {
//     const titulo = this.usuarioLogueado?.rol === 'doctor' ? 'Dr.' : 
//                    this.usuarioLogueado?.rol === 'admin' ? 'Admin.' : '';
//     return `${titulo} ${this.nombreCompleto}`.trim();
//   }

//   get rolUsuario(): string {
//     return this.usuarioLogueado?.rol || 'usuario';
//   }

//   get rolFormateado(): string {
//     const roles = {
//       'doctor': 'Doctor',
//       'admin': 'Administrador', 
//       'paciente': 'Paciente'
//     };
//     return roles[this.rolUsuario as keyof typeof roles] || 'Usuario';
//   }

//   get iniciales(): string {
//     const nombres = this.doctor.nombre.split(' ');
//     const apellidos = this.doctor.apellidos.split(' ');
//     const primerNombre = nombres[0]?.[0] || '';
//     const primerApellido = apellidos[0]?.[0] || '';
//     return (primerNombre + primerApellido).toUpperCase();
//   }

//   get edadCalculada(): number {
//     if (!this.doctor.fechaNacimiento) return 0;
//     const hoy = new Date();
//     const nacimiento = new Date(this.doctor.fechaNacimiento);
//     let edad = hoy.getFullYear() - nacimiento.getFullYear();
//     const mesActual = hoy.getMonth();
//     const mesNacimiento = nacimiento.getMonth();
    
//     if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
//       edad--;
//     }
    
//     return edad;
//   }

//   get direccionCompleta(): string {
//     return this.doctor.direccion || 'No especificada';
//   }

//   get tipoDocumento(): string {
//     return this.usuarioLogueado?.tipoDocumento || 'DNI';
//   }

//   // 🔧 Validaciones
//   get formularioValido(): boolean {
//     return !!(
//       this.doctor.nombre.trim() &&
//       this.doctor.apellidos.trim() &&
//       this.doctor.especialidad.trim() &&
//       this.doctor.numeroRegistro.trim() &&
//       this.doctor.telefono.trim() &&
//       this.doctor.email.trim()
//     );
//   }

//   get horariosConfigurados(): number {
//     return this.doctor.horarioAtencion.filter(h => h.disponible).length;
//   }

// }
