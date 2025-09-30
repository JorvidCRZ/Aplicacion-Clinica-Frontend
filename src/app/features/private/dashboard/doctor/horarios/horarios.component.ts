import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth.service';
import { Doctor } from '../../../../../core/models/users/doctor';

interface HorarioBloque {
  id: number;
  horaInicio: string;
  horaFin: string;
  tipo: 'consulta' | 'urgencias' | 'procedimiento' | 'descanso';
  activo: boolean;
}

interface DiaSemana {
  id: number;
  nombre: string;
  abrev: string;
  activo: boolean;
  horarios: HorarioBloque[];
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.css'
})
export class HorariosComponent implements OnInit {
  
  private authService = inject(AuthService);
  
  doctorActual: Doctor | null = null;
  guardandoHorarios = false;

  diasSemana: DiaSemana[] = [
    { id: 1, nombre: 'Lunes', abrev: 'LUN', activo: true, horarios: [] },
    { id: 2, nombre: 'Martes', abrev: 'MAR', activo: true, horarios: [] },
    { id: 3, nombre: 'Miércoles', abrev: 'MIE', activo: true, horarios: [] },
    { id: 4, nombre: 'Jueves', abrev: 'JUE', activo: true, horarios: [] },
    { id: 5, nombre: 'Viernes', abrev: 'VIE', activo: true, horarios: [] },
    { id: 6, nombre: 'Sábado', abrev: 'SAB', activo: false, horarios: [] },
    { id: 7, nombre: 'Domingo', abrev: 'DOM', activo: false, horarios: [] }
  ];

  tiposHorario = [
    { value: 'consulta', label: 'Consulta General', color: 'success' },
    { value: 'procedimiento', label: 'Procedimientos', color: 'warning' },
    { value: 'descanso', label: 'Descanso', color: 'secondary' }
  ];

  nuevoHorario: HorarioBloque = {
    id: 0,
    horaInicio: '08:00',
    horaFin: '09:00',
    tipo: 'consulta',
    activo: true
  };

  diaSeleccionado: number = 1;

  ngOnInit() {
    this.cargarDoctorActual();
    this.cargarHorariosGuardados();
  }

  cargarDoctorActual() {
    const usuario = this.authService.currentUser;
    if (usuario && usuario.rol === 'doctor') {
      this.doctorActual = usuario as Doctor;
    }
  }

  cargarHorariosGuardados() {
    if (this.doctorActual) {
      const horariosGuardados = localStorage.getItem(`horarios_doctor_${this.doctorActual.id}`);
      if (horariosGuardados) {
        this.diasSemana = JSON.parse(horariosGuardados);
      } else {
        this.generarHorariosBase();
      }
    }
  }

  generarHorariosBase() {
    // Generar horarios base según la especialidad del doctor
    const horariosBase = this.obtenerHorariosSegunEspecialidad();
    
    this.diasSemana.forEach(dia => {
      if (dia.activo && dia.id <= 5) { // Solo días laborables
        dia.horarios = [...horariosBase];
      }
    });
  }

  obtenerHorariosSegunEspecialidad(): HorarioBloque[] {
    const especialidad = this.doctorActual?.especialidad?.toLowerCase();
    let horarios: HorarioBloque[] = [];

    switch (especialidad) {
      case 'cardiología':
        horarios = [
          { id: 1, horaInicio: '08:00', horaFin: '12:00', tipo: 'consulta', activo: true },
          { id: 2, horaInicio: '14:00', horaFin: '18:00', tipo: 'procedimiento', activo: true }
        ];
        break;
      case 'pediatría':
        horarios = [
          { id: 1, horaInicio: '08:00', horaFin: '13:00', tipo: 'consulta', activo: true },
          { id: 2, horaInicio: '15:00', horaFin: '17:00', tipo: 'consulta', activo: true }
        ];
        break;
      case 'traumatología':
        horarios = [
          { id: 1, horaInicio: '07:00', horaFin: '12:00', tipo: 'consulta', activo: true },
          { id: 2, horaInicio: '13:00', horaFin: '14:00', tipo: 'descanso', activo: true },
          { id: 3, horaInicio: '14:00', horaFin: '19:00', tipo: 'urgencias', activo: true }
        ];
        break;
      default:
        horarios = [
          { id: 1, horaInicio: '08:00', horaFin: '12:00', tipo: 'consulta', activo: true },
          { id: 2, horaInicio: '14:00', horaFin: '18:00', tipo: 'consulta', activo: true }
        ];
    }

    return horarios;
  }

  agregarHorario() {
    console.log('agregarHorario llamado');
    console.log('diaSeleccionado:', this.diaSeleccionado, 'tipo:', typeof this.diaSeleccionado);
    
    // Convertir a número si es string
    const diaId = typeof this.diaSeleccionado === 'string' ? parseInt(this.diaSeleccionado) : this.diaSeleccionado;
    
    const dia = this.diasSemana.find(d => d.id === diaId);
    console.log('dia encontrado:', dia);
    
    if (dia) {
      // Fix: Manejar correctamente cuando no hay horarios existentes
      const idsExistentes = dia.horarios.map(h => h.id);
      const nuevoId = idsExistentes.length > 0 ? Math.max(...idsExistentes) + 1 : 1;
      
      const horario: HorarioBloque = {
        ...this.nuevoHorario,
        id: nuevoId
      };
      
      console.log('horario a agregar:', horario);
      
      if (this.validarHorario(horario, dia)) {
        console.log('horario válido, agregando...');
        dia.horarios.push(horario);
        dia.horarios.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
        this.resetearFormulario();
        console.log('horario agregado exitosamente');
      } else {
        console.log('horario no válido');
      }
    } else {
      console.log('día no encontrado');
    }
  }

  validarHorario(horario: HorarioBloque, dia: DiaSemana): boolean {
    console.log('validando horario:', horario);
    
    // Validar que la hora de inicio sea menor que la hora de fin
    if (horario.horaInicio >= horario.horaFin) {
      console.log('Error: hora inicio >= hora fin');
      alert('La hora de inicio debe ser menor que la hora de fin');
      return false;
    }

    // Validar solapamiento con otros horarios
    const solapamiento = dia.horarios.some(h => 
      h.id !== horario.id && (
        (horario.horaInicio >= h.horaInicio && horario.horaInicio < h.horaFin) ||
        (horario.horaFin > h.horaInicio && horario.horaFin <= h.horaFin) ||
        (horario.horaInicio <= h.horaInicio && horario.horaFin >= h.horaFin)
      )
    );

    if (solapamiento) {
      console.log('Error: solapamiento detectado');
      alert('El horario se solapa con otro horario existente');
      return false;
    }

    console.log('horario válido');
    return true;
  }

  eliminarHorario(diaId: number, horarioId: number) {
    const dia = this.diasSemana.find(d => d.id === diaId);
    if (dia) {
      dia.horarios = dia.horarios.filter(h => h.id !== horarioId);
    }
  }

  toggleDia(diaId: number) {
    const dia = this.diasSemana.find(d => d.id === diaId);
    if (dia) {
      dia.activo = !dia.activo;
      if (!dia.activo) {
        dia.horarios = [];
      }
    }
  }

  guardarHorarios() {
    if (this.doctorActual) {
      this.guardandoHorarios = true;
      
      setTimeout(() => {
        localStorage.setItem(`horarios_doctor_${this.doctorActual!.id}`, JSON.stringify(this.diasSemana));
        this.guardandoHorarios = false;
        alert('Horarios guardados exitosamente');
      }, 1000);
    }
  }

  resetearFormulario() {
    this.nuevoHorario = {
      id: 0,
      horaInicio: '08:00',
      horaFin: '09:00',
      tipo: 'consulta',
      activo: true
    };
  }

  copiarHorario(diaOrigen: number, diaDestino: number) {
    const origen = this.diasSemana.find(d => d.id === diaOrigen);
    const destino = this.diasSemana.find(d => d.id === diaDestino);
    
    if (origen && destino) {
      // Fix: Manejar correctamente cuando destino no tiene horarios
      const idsExistentesDestino = destino.horarios.map(hr => hr.id);
      const maxIdDestino = idsExistentesDestino.length > 0 ? Math.max(...idsExistentesDestino) : 0;
      
      destino.horarios = origen.horarios.map((h, index) => ({
        ...h,
        id: maxIdDestino + index + 1
      }));
      destino.activo = true;
    }
  }

  obtenerColorTipo(tipo: string): string {
    const tipoObj = this.tiposHorario.find(t => t.value === tipo);
    return tipoObj ? tipoObj.color : 'primary';
  }

  obtenerNombreCompleto(): string {
    if (!this.doctorActual) return 'Doctor';
    return `Dr. ${this.doctorActual.nombre} ${this.doctorActual.apellidoPaterno || ''}`;
  }

  calcularTotalHoras(dia: DiaSemana): string {
    if (!dia.activo || dia.horarios.length === 0) return '0h';
    
    let totalMinutos = 0;
    dia.horarios.forEach(horario => {
      if (horario.tipo !== 'descanso') {
        const inicio = this.convertirHoraAMinutos(horario.horaInicio);
        const fin = this.convertirHoraAMinutos(horario.horaFin);
        totalMinutos += fin - inicio;
      }
    });

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return minutos > 0 ? `${horas}h ${minutos}m` : `${horas}h`;
  }

  private convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  // Métodos helper para el template
  obtenerLabelTipo(tipo: string): string {
    const tipoObj = this.tiposHorario.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  obtenerDiasActivos(): number {
    return this.diasSemana.filter(d => d.activo).length;
  }

  obtenerBloquesConsulta(): number {
    return this.diasSemana.reduce((total, dia) => 
      total + dia.horarios.filter(h => h.tipo === 'consulta').length, 0
    );
  }

  obtenerBloquesProcedimiento(): number {
    return this.diasSemana.reduce((total, dia) => 
      total + dia.horarios.filter(h => h.tipo === 'procedimiento').length, 0
    );
  }

  obtenerBloquesUrgencias(): number {
    return this.diasSemana.reduce((total, dia) => 
      total + dia.horarios.filter(h => h.tipo === 'urgencias').length, 0
    );
  }

  tieneDiasConHorarios(diaActual: DiaSemana): boolean {
    return this.diasSemana.some(d => d.id !== diaActual.id && d.horarios.length > 0);
  }

  // Cálculos de horas mensuales
  obtenerHorasSemanalesTotales(): number {
    let totalMinutos = 0;
    this.diasSemana.forEach(dia => {
      if (dia.activo) {
        dia.horarios.forEach(horario => {
          if (horario.tipo !== 'descanso') {
            const inicio = this.convertirHoraAMinutos(horario.horaInicio);
            const fin = this.convertirHoraAMinutos(horario.horaFin);
            totalMinutos += fin - inicio;
          }
        });
      }
    });
    return Math.round(totalMinutos / 60 * 100) / 100; // Redondear a 2 decimales
  }

  obtenerHorasMensuales(): number {
    return Math.round(this.obtenerHorasSemanalesTotales() * 4.33 * 100) / 100; // Promedio de semanas por mes
  }

  obtenerHorasConsultaMensual(): number {
    let totalMinutos = 0;
    this.diasSemana.forEach(dia => {
      if (dia.activo) {
        dia.horarios.forEach(horario => {
          if (horario.tipo === 'consulta') {
            const inicio = this.convertirHoraAMinutos(horario.horaInicio);
            const fin = this.convertirHoraAMinutos(horario.horaFin);
            totalMinutos += fin - inicio;
          }
        });
      }
    });
    return Math.round(totalMinutos / 60 * 4.33 * 100) / 100;
  }

  obtenerHorasUrgenciasMensual(): number {
    let totalMinutos = 0;
    this.diasSemana.forEach(dia => {
      if (dia.activo) {
        dia.horarios.forEach(horario => {
          if (horario.tipo === 'urgencias') {
            const inicio = this.convertirHoraAMinutos(horario.horaInicio);
            const fin = this.convertirHoraAMinutos(horario.horaFin);
            totalMinutos += fin - inicio;
          }
        });
      }
    });
    return Math.round(totalMinutos / 60 * 4.33 * 100) / 100;
  }

  formatearHoras(horas: number): string {
    const horasEnteras = Math.floor(horas);
    const minutos = Math.round((horas - horasEnteras) * 60);
    if (minutos === 0) {
      return `${horasEnteras}h`;
    }
    return `${horasEnteras}h ${minutos}m`;
  }

  calcularPacientesMensuales(): number {
    return Math.round(this.obtenerHorasConsultaMensual() * 2);
  }
}
