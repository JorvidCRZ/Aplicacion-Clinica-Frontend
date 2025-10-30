// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { AuthService } from '../../../../../core/services/rol/auth.service';
// import { Doctor } from '../../../../../core/models/users/doctor';

// // 📅 Interfaces para gestión de citas del doctor
// interface Paciente {
//   id: number;
//   nombre: string;
//   documento: string;
//   telefono: string;
//   email: string;
// }

// interface Cita {
//   id: number;
//   fecha: string;
//   hora: string;
//   paciente: Paciente;
//   tipoConsulta: string;
//   especialidad: string; // Nueva propiedad
//   motivo?: string;
//   estado: 'programada' | 'completada' | 'cancelada' | 'no-show';
//   duracionEstimada: number; // en minutos
// }

// @Component({
//   selector: 'app-citas',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './citas.component.html',
//   styleUrl: './citas.component.css'
// })
// export class CitasComponent implements OnInit {
//   private authService = inject(AuthService);
  
//   // 👨‍⚕️ Doctor actual
//   doctorActual: Doctor | null = null;

//   // 📊 Datos de citas
//   citasOriginales: Cita[] = [];
//   citasFiltradas: Cita[] = [];
//   citasPaginadas: Cita[] = []; // Nueva propiedad para paginación

//   // 🎛️ Filtros
//   filtroFecha = '';
//   filtroEstado = '';
//   busquedaPaciente = '';

//   // 📊 Paginación Híbrida
//   paginaActual = 1;
//   registrosPorPagina = 10;
//   totalPaginas = 0;
//   registrosIniciales = 0;
//   registrosFinales = 0;
//   totalRegistros = 0;
  
//   // 🔄 Carga por lotes
//   citasVisibles: Cita[] = []; // Citas actualmente visibles
//   lotesPorPagina = 2; // Cuántos lotes mostrar por página
//   cargandoMas = false;
//   hayMasRegistros = true;
  
//   // 📋 Solicitudes pendientes
//   solicitudesCancelacion: Map<number, boolean> = new Map(); // ID cita -> pendiente

//   // 📈 Estadísticas
//   citasHoy = 0;
//   citasPendientes = 0;
//   citasCompletadas = 0;
//   tiempoEstimadoHoy = 0;
//   eficienciaDia = 94;
//   proximaCita: Cita | null = null;

//   ngOnInit(): void {
//     this.obtenerDoctorActual();
//     this.cargarCitas();
//     this.calcularEstadisticas();
//     // No filtrar por fecha inicialmente, mostrar todas las citas
//     this.filtrarCitas();
//   }
  
//   // 👨‍⚕️ Obtener doctor logueado
//   private obtenerDoctorActual(): void {
//     this.authService.authState$.subscribe(authState => {
//       if (authState.isLoggedIn && authState.user?.rol === 'doctor') {
//         this.doctorActual = authState.user as Doctor;
//         console.log('👨‍⚕️ Doctor actual:', this.doctorActual);
//         console.log('🎯 Especialidad del doctor:', this.doctorActual.especialidad);
//       }
//     });
//   }

//   // 📅 Cargar citas de ejemplo
//   private cargarCitas(): void {
//     // Todas las citas del sistema (simulando base de datos)
//     const todasLasCitas: Cita[] = [
//       {
//         id: 1,
//         fecha: '2025-09-29',
//         hora: '08:00',
//         paciente: {
//           id: 1,
//           nombre: 'María García López',
//           documento: '12345678',
//           telefono: '3001234567',
//           email: 'maria.garcia@email.com'
//         },
//         tipoConsulta: 'Control Cardiológico',
//         especialidad: 'Cardiología',
//         motivo: 'Control de presión arterial y medicamentos',
//         estado: 'programada',
//         duracionEstimada: 30
//       },
//       {
//         id: 2,
//         fecha: '2025-09-29',
//         hora: '08:30',
//         paciente: {
//           id: 2,
//           nombre: 'Carlos Rodríguez Méndez',
//           documento: '87654321',
//           telefono: '3009876543',
//           email: 'carlos.rodriguez@email.com'
//         },
//         tipoConsulta: 'Consulta General',
//         especialidad: 'Medicina General',
//         motivo: 'Dolor en el pecho y dificultad para respirar',
//         estado: 'programada',
//         duracionEstimada: 45
//       },
//       {
//         id: 3,
//         fecha: '2025-09-29',
//         hora: '09:15',
//         paciente: {
//           id: 3,
//           nombre: 'Ana Martínez Silva',
//           documento: '11223344',
//           telefono: '3005556789',
//           email: 'ana.martinez@email.com'
//         },
//         tipoConsulta: 'Electrocardiograma',
//         especialidad: 'Cardiología',
//         motivo: 'Examen de rutina post-cirugía',
//         estado: 'completada',
//         duracionEstimada: 30
//       },
//       {
//         id: 4,
//         fecha: '2025-09-30',
//         hora: '10:00',
//         paciente: {
//           id: 4,
//           nombre: 'Luis Fernández Castro',
//           documento: '55667788',
//           telefono: '3002223333',
//           email: 'luis.fernandez@email.com'
//         },
//         tipoConsulta: 'Control de Diabetes',
//         especialidad: 'Medicina General',
//         motivo: 'Seguimiento de niveles de glucosa',
//         estado: 'cancelada',
//         duracionEstimada: 30
//       },
//       {
//         id: 5,
//         fecha: '2025-09-30',
//         hora: '10:30',
//         paciente: {
//           id: 5,
//           nombre: 'Patricia Jiménez Vega',
//           documento: '99887766',
//           telefono: '3007778888',
//           email: 'patricia.jimenez@email.com'
//         },
//         tipoConsulta: 'Primera Consulta',
//         especialidad: 'Cardiología',
//         motivo: 'Evaluación inicial de salud cardiovascular',
//         estado: 'programada',
//         duracionEstimada: 60
//       },
//       {
//         id: 6,
//         fecha: '2025-10-01',
//         hora: '11:30',
//         paciente: {
//           id: 6,
//           nombre: 'Roberto Sánchez Torres',
//           documento: '44556677',
//           telefono: '3004445555',
//           email: 'roberto.sanchez@email.com'
//         },
//         tipoConsulta: 'Control Post-operatorio',
//         especialidad: 'Cardiología',
//         motivo: 'Seguimiento después de bypass coronario',
//         estado: 'programada',
//         duracionEstimada: 45
//       }
//     ];
    
//     // 🔄 Agregar más citas para demostrar la paginación
//     const especialidades = ['Cardiología', 'Medicina General', 'Pediatría', 'Dermatología', 'Neurología'];
//     for (let i = 7; i <= 25; i++) {
//       todasLasCitas.push({
//         id: i,
//         fecha: i <= 15 ? '2025-10-01' : '2025-10-02',
//         hora: `${8 + Math.floor(i / 3)}:${(i % 3) * 20}0`.padStart(5, '0'),
//         paciente: {
//           id: i,
//           nombre: `Paciente ${i} Test`,
//           documento: `${10000000 + i}`,
//           telefono: `300${1000000 + i}`,
//           email: `paciente${i}@email.com`
//         },
//         tipoConsulta: ['Control General', 'Primera Consulta', 'Seguimiento', 'Emergencia'][i % 4],
//         especialidad: especialidades[i % especialidades.length],
//         motivo: `Consulta programada ${i}`,
//         estado: ['programada', 'completada', 'programada', 'cancelada'][i % 4] as 'programada' | 'completada' | 'cancelada' | 'no-show',
//         duracionEstimada: [30, 45, 60][i % 3]
//       });
//     }
    
//     // 🎯 Filtrar solo las citas de la especialidad del doctor
//     this.citasOriginales = this.filtrarCitasPorEspecialidad(todasLasCitas);
//     console.log('📅 Citas cargadas para el doctor:', this.citasOriginales.length);
//   }
  
//   // 🎯 Filtrar citas por especialidad del doctor
//   private filtrarCitasPorEspecialidad(citas: Cita[]): Cita[] {
//     if (!this.doctorActual?.especialidad) {
//       console.log('⚠️ No hay doctor logueado o especialidad definida');
//       return citas; // Si no hay doctor, mostrar todas (para desarrollo)
//     }
    
//     const citasFiltradas = citas.filter(cita => 
//       cita.especialidad === this.doctorActual!.especialidad
//     );
    
//     console.log(`🎯 Filtrando citas de ${this.doctorActual.especialidad}:`, citasFiltradas.length);
//     return citasFiltradas;
//   }

//   // 📊 Calcular estadísticas
//   private calcularEstadisticas(): void {
//     const fechaHoy = this.obtenerFechaHoy();
//     const citasHoyArray = this.citasOriginales.filter(cita => cita.fecha === fechaHoy);
    
//     this.citasHoy = citasHoyArray.length;
//     this.citasPendientes = this.citasOriginales.filter(cita => cita.estado === 'programada').length;
//     this.citasCompletadas = this.citasOriginales.filter(cita => cita.estado === 'completada').length;
    
//     this.tiempoEstimadoHoy = citasHoyArray.reduce((total, cita) => 
//       total + cita.duracionEstimada, 0) / 60; // Convertir a horas
    
//     // Encontrar próxima cita
//     const citasProgramadas = this.citasOriginales
//       .filter(cita => cita.estado === 'programada')
//       .sort((a, b) => new Date(a.fecha + ' ' + a.hora).getTime() - new Date(b.fecha + ' ' + b.hora).getTime());
    
//     this.proximaCita = citasProgramadas.length > 0 ? citasProgramadas[0] : null;
//   }

//   // 🔍 Filtrar citas
//   filtrarCitas(): void {
//     this.citasFiltradas = this.citasOriginales.filter(cita => {
//       const cumpleFecha = !this.filtroFecha || cita.fecha === this.filtroFecha;
//       const cumpleEstado = !this.filtroEstado || cita.estado === this.filtroEstado;
//       const cumpleBusqueda = !this.busquedaPaciente || 
//         cita.paciente.nombre.toLowerCase().includes(this.busquedaPaciente.toLowerCase()) ||
//         cita.paciente.documento.includes(this.busquedaPaciente);
      
//       return cumpleFecha && cumpleEstado && cumpleBusqueda;
//     });
    
//     // Resetear a la primera página cuando se filtran los datos
//     this.paginaActual = 1;
//     this.citasVisibles = [];
//     this.hayMasRegistros = true;
//     this.aplicarPaginacion();
//   }

//   // 🧹 Limpiar filtros
//   limpiarFiltros(): void {
//     this.filtroFecha = this.obtenerFechaHoy();
//     this.filtroEstado = '';
//     this.busquedaPaciente = '';
//     this.filtrarCitas();
//   }

//   // 📝 Obtener texto descriptivo del filtro
//   obtenerTextoFiltro(): string {
//     if (this.filtroFecha === this.obtenerFechaHoy()) {
//       return 'de Hoy';
//     } else if (this.filtroFecha) {
//       return `del ${new Date(this.filtroFecha).toLocaleDateString()}`;
//     }
    
//     // Si hay doctor con especialidad, mostrar eso en lugar de "Todas"
//     if (this.doctorActual?.especialidad) {
//       return `de ${this.doctorActual.especialidad}`;
//     }
    
//     return 'Disponibles';
//   }

//   // ⚡ Acciones de citas
//   iniciarConsulta(cita: Cita): void {
//     console.log('Iniciando consulta:', cita);
//     // Aquí iría la lógica para iniciar la consulta
//     alert(`Iniciando consulta con ${cita.paciente.nombre}`);
//   }

//   reprogramarCita(cita: Cita): void {
//     console.log('Reprogramando cita:', cita);
//     alert(`Reprogramar cita de ${cita.paciente.nombre}`);
//   }

//   solicitarCancelacion(cita: Cita): void {
//     if (confirm(`¿Está seguro de solicitar la cancelación de la cita de ${cita.paciente.nombre}?\n\nEsta solicitud será enviada al administrador para su aprobación.`)) {
//       // Marcar como solicitud pendiente
//       this.solicitudesCancelacion.set(cita.id, true);
      
//       // Simular envío al backend
//       console.log('Solicitud de cancelación enviada:', {
//         citaId: cita.id,
//         doctorId: 'doctor-actual', // En app real vendría del AuthService
//         paciente: cita.paciente.nombre,
//         fecha: cita.fecha,
//         hora: cita.hora,
//         motivo: '', // Se podría agregar un campo para el motivo
//         timestamp: new Date().toISOString()
//       });
      
//       alert(`Solicitud de cancelación enviada al administrador.\n\nRecibirá una notificación cuando sea procesada.`);
//     }
//   }
  
//   // Verificar si una cita tiene solicitud de cancelación pendiente
//   tieneSolicitudCancelacion(citaId: number): boolean {
//     return this.solicitudesCancelacion.get(citaId) || false;
//   }

//   verHistorial(cita: Cita): void {
//     console.log('Ver historial:', cita);
//     alert(`Ver historial médico de ${cita.paciente.nombre}`);
//   }

//   verDetalles(cita: Cita): void {
//     console.log('Ver detalles:', cita);
//     alert(`Detalles de la cita de ${cita.paciente.nombre}`);
//   }

//   // 🗓️ Utilidades de fecha
//   private obtenerFechaHoy(): string {
//     return new Date().toISOString().split('T')[0];
//   }

//   formatearFecha(fecha: string): string {
//     const fechaObj = new Date(fecha + 'T00:00:00');
//     const opciones: Intl.DateTimeFormatOptions = { 
//       day: '2-digit', 
//       month: 'short', 
//       year: 'numeric' 
//     };
//     return fechaObj.toLocaleDateString('es-ES', opciones);
//   }

//   // 📊 Métodos de paginación híbrida
//   aplicarPaginacion(): void {
//     this.totalRegistros = this.citasFiltradas.length;
//     // Calcular páginas basado en registrosPorPagina normal (no multiplicado)
//     this.totalPaginas = Math.ceil(this.totalRegistros / this.registrosPorPagina);
    
//     // Cargar primer lote de la página actual
//     this.cargarLoteDePagina();
//   }
  
//   private cargarLoteDePagina(): void {
//     const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
//     let fin = inicio + Math.floor(this.registrosPorPagina / this.lotesPorPagina); // Cargar solo parte inicial
    
//     // Si es menos de 5 registros por página, mostrar todos
//     if (this.registrosPorPagina <= 5) {
//       fin = inicio + this.registrosPorPagina;
//     }
    
//     this.citasVisibles = this.citasFiltradas.slice(inicio, fin);
//     this.citasPaginadas = this.citasVisibles; // Para compatibilidad
    
//     this.registrosIniciales = this.totalRegistros > 0 ? inicio + 1 : 0;
//     this.registrosFinales = Math.min(fin, this.totalRegistros);
    
//     // Verificar si hay más registros en esta página para cargar
//     const maxEnPagina = inicio + this.registrosPorPagina;
//     this.hayMasRegistros = fin < Math.min(maxEnPagina, this.totalRegistros) && this.registrosPorPagina > 5;
//   }

//   irAPagina(pagina: number): void {
//     if (pagina >= 1 && pagina <= this.totalPaginas) {
//       this.paginaActual = pagina;
//       this.citasVisibles = [];
//       this.hayMasRegistros = true;
//       this.aplicarPaginacion();
//     }
//   }

//   paginaAnterior(): void {
//     this.irAPagina(this.paginaActual - 1);
//   }

//   paginaSiguiente(): void {
//     this.irAPagina(this.paginaActual + 1);
//   }

//   cambiarRegistrosPorPagina(cantidad: number): void {
//     this.registrosPorPagina = cantidad;
//     this.paginaActual = 1;
//     this.aplicarPaginacion();
//   }

//   obtenerNumerosPagina(): number[] {
//     const paginas = [];
//     const inicio = Math.max(1, this.paginaActual - 2);
//     const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    
//     for (let i = inicio; i <= fin; i++) {
//       paginas.push(i);
//     }
    
//     return paginas;
//   }
  
//   // 🔄 Cargar más registros (por lotes)
//   cargarMasRegistros(): void {
//     if (this.cargandoMas || !this.hayMasRegistros) return;
    
//     this.cargandoMas = true;
    
//     // Simular delay de carga
//     setTimeout(() => {
//       const inicioPagina = (this.paginaActual - 1) * this.registrosPorPagina;
//       const inicioNuevoLote = inicioPagina + this.citasVisibles.length;
//       const loteSize = Math.floor(this.registrosPorPagina / this.lotesPorPagina);
//       const finNuevoLote = Math.min(inicioNuevoLote + loteSize, inicioPagina + this.registrosPorPagina);
      
//       const nuevoLote = this.citasFiltradas.slice(inicioNuevoLote, finNuevoLote);
//       this.citasVisibles = [...this.citasVisibles, ...nuevoLote];
//       this.citasPaginadas = this.citasVisibles; // Para compatibilidad
      
//       this.registrosFinales = Math.min(inicioNuevoLote + nuevoLote.length, this.totalRegistros);
      
//       // Verificar si hay más registros en esta página
//       const maxEnPagina = inicioPagina + this.registrosPorPagina;
//       this.hayMasRegistros = finNuevoLote < maxEnPagina && finNuevoLote < this.totalRegistros;
      
//       this.cargandoMas = false;
//     }, 500);
//   }
// }
