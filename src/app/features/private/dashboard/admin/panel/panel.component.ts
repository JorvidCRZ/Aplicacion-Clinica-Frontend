// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { Usuario } from '../../../../../core/models/users/usuario';
// import { CitaCompleta } from '../../../../../core/models/common/cita';

// interface EstadisticaPanel {
//   titulo: string;
//   valor: number;
//   icono: string;
//   color: string;
//   cambio?: string;
//   tendencia?: 'up' | 'down' | 'stable';
// }

// interface CitaReciente {
//   id: number;
//   paciente: string;
//   doctor: string;
//   fecha: string;
//   hora: string;
//   estado: string;
// }

// @Component({
//   selector: 'app-panel',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './panel.component.html',
//   styleUrl: './panel.component.css'
// })
// export class PanelComponent implements OnInit {
//   //  Fecha actual
//   fechaActual = new Date();
  
//   // Estadísticas principales
//   estadisticas: EstadisticaPanel[] = [];
  
//   //  Citas de hoy
//   citasHoy: CitaReciente[] = [];
  
//   //  Datos para gráficos
//   citasPorEstado = {
//     confirmadas: 0,
//     pendientes: 0,
//     completadas: 0,
//     canceladas: 0
//   };

//   ngOnInit(): void {
//     this.cargarEstadisticas();
//     this.cargarCitasHoy();
//     this.cargarEstadisticasCitas();
//   }

//   // Cargar estadísticas principales
//   private cargarEstadisticas(): void {
//     const usuarios = this.obtenerUsuarios();
//     const citas = this.obtenerCitas();
//     const doctores = usuarios.filter(u => u.rol === 'doctor');
//     const pacientes = usuarios.filter(u => u.rol === 'paciente');

//     this.estadisticas = [
//       {
//         titulo: 'Total Pacientes',
//         valor: pacientes.length,
//         icono: 'fa-users',
//         color: '#2363B9',
//         cambio: '+5%',
//         tendencia: 'up'
//       },
//       {
//         titulo: 'Doctores Activos',
//         valor: doctores.length,
//         icono: 'fa-user-md',
//         color: '#8fddff',
//         cambio: '+2%',
//         tendencia: 'up'
//       },
//       {
//         titulo: 'Citas Programadas',
//         valor: citas.filter(c => c.estado === 'confirmada' || c.estado === 'pendiente').length,
//         icono: 'fa-calendar-check',
//         color: '#4CAF50',
//         cambio: '+12%',
//         tendencia: 'up'
//       },
//       {
//         titulo: 'Citas Completadas',
//         valor: citas.filter(c => c.estado === 'completada').length,
//         icono: 'fa-check-circle',
//         color: '#FF9800',
//         cambio: '+8%',
//         tendencia: 'up'
//       }
//     ];
//   }

//   //  Cargar citas de hoy
//   private cargarCitasHoy(): void {
//     const citas = this.obtenerCitas();
//     const hoy = new Date().toISOString().split('T')[0];
    
//     this.citasHoy = citas
//       .filter(cita => cita.fecha === hoy)
//       .map(cita => ({
//         id: cita.id,
//         paciente: cita.pacienteNombre,
//         doctor: cita.doctorNombre,
//         fecha: cita.fecha,
//         hora: cita.hora,
//         estado: cita.estado
//       }))
//       .slice(0, 5); // Mostrar solo las primeras 5
//   }

//   // Cargar estadísticas de citas
//   private cargarEstadisticasCitas(): void {
//     const citas = this.obtenerCitas();
    
//     this.citasPorEstado = {
//       confirmadas: citas.filter(c => c.estado === 'confirmada').length,
//       pendientes: citas.filter(c => c.estado === 'pendiente').length,
//       completadas: citas.filter(c => c.estado === 'completada').length,
//       canceladas: citas.filter(c => c.estado === 'cancelada').length
//     };
//   }

//   // Obtener usuarios desde localStorage
//   private obtenerUsuarios(): Usuario[] {
//     const usuariosStr = localStorage.getItem('usuarios');
//     return usuariosStr ? JSON.parse(usuariosStr) : [];
//   }

//   //  Obtener citas desde localStorage
//   private obtenerCitas(): CitaCompleta[] {
//     const citasStr = localStorage.getItem('citas');
//     return citasStr ? JSON.parse(citasStr) : [];
//   }

//   // Obtener clase CSS para el estado de cita
//   getEstadoClass(estado: string): string {
//     switch (estado) {
//       case 'confirmada': return 'estado-confirmada';
//       case 'pendiente': return 'estado-pendiente';
//       case 'completada': return 'estado-completada';
//       case 'cancelada': return 'estado-cancelada';
//       default: return 'estado-default';
//     }
//   }

//   //  Calcular porcentaje para gráficos
//   calcularPorcentaje(valor: number, total: number): number {
//     return total > 0 ? Math.round((valor / total) * 100) : 0;
//   }

//   // Obtener total de citas
//   get totalCitas(): number {
//     return Object.values(this.citasPorEstado).reduce((sum, count) => sum + count, 0);
//   }
// }
