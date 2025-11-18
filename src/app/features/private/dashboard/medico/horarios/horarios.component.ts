import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { MedicosService } from '../../../../../core/services/logic/medico.service';

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
  styleUrl: './horarios.component.css',
})
export class HorariosComponent implements OnInit {
  private authService = inject(AuthService);
private medicosService = inject(MedicosService);

  doctorActual: DoctorVM | null = null;
  guardandoHorarios = false;

  diasSemana: DiaSemana[] = [
    { id: 1, nombre: 'Lunes', abrev: 'LUN', activo: true, horarios: [] },
    { id: 2, nombre: 'Martes', abrev: 'MAR', activo: true, horarios: [] },
    { id: 3, nombre: 'Miércoles', abrev: 'MIE', activo: true, horarios: [] },
    { id: 4, nombre: 'Jueves', abrev: 'JUE', activo: true, horarios: [] },
    { id: 5, nombre: 'Viernes', abrev: 'VIE', activo: true, horarios: [] },
    { id: 6, nombre: 'Sábado', abrev: 'SAB', activo: false, horarios: [] },
    { id: 7, nombre: 'Domingo', abrev: 'DOM', activo: false, horarios: [] },
  ];

  tiposHorario = [
    { value: 'consulta', label: 'Consulta General', color: 'success' },
    { value: 'procedimiento', label: 'Procedimientos', color: 'warning' },
    { value: 'descanso', label: 'Descanso', color: 'secondary' },
  ];

  nuevoHorario: HorarioBloque = {
    id: 0,
    horaInicio: '08:00',
    horaFin: '09:00',
    tipo: 'consulta',
    activo: true,
  };

  diaSeleccionado: number = 1;

  ngOnInit() {
    this.cargarDoctorActual();
  }

 cargarDoctorActual() {
  const usuario = this.authService.currentUser as any;
  if (!usuario) return;

  const p = usuario.persona || {};
  const correo = usuario.correo || '';

  // Primero obtenemos el médico correspondiente al usuario logueado
  this.medicosService.obtenerMedicoPorUsuario(usuario.idUsuario).subscribe({
    next: (res: any) => {
      const medico = res; // asumiendo que el backend devuelve { data: { idMedico, nombre, ... } }

      if (!medico) {
        console.warn("No se encontró un médico asociado a este usuario");
        return;
      }

      this.doctorActual = {
        id: medico.idMedico, // ⚠️ Usamos el idMedico real del backend
        nombre: medico.nombre || p.nombre1 || 'Doctor',
        apellidoPaterno: medico.apellidoPaterno || p.apellidoPaterno || '',
        correo,
        especialidad: medico.especialidad || localStorage.getItem(`medico_especialidad:${correo}`) || undefined,
      };

      // Una vez tenemos el doctorActual correcto, cargamos los horarios
      this.cargarHorariosGuardados();
    },
    error: (err) => {
      console.error("Error obteniendo médico por usuario:", err);
      alert("No se pudo cargar la información del médico.");
    }
  });
}


  cargarHorariosGuardados() {
  if (!this.doctorActual) return;

  // Siempre cargamos desde el backend
  this.generarHorariosBase();
}



 generarHorariosBase() {
  if (!this.doctorActual) return;

  const idMedico = this.doctorActual.id;

  this.medicosService.obtenerDisponibilidad(idMedico).subscribe({
    next: (res: any) => {
      const horariosBackend = res.data;

      // Limpiamos todos los horarios primero
      this.diasSemana.forEach(dia => dia.horarios = []);

      if (!horariosBackend || horariosBackend.length === 0) return;

      // Organizamos los horarios por día
      this.diasSemana.forEach(dia => {
        const horariosDelDia = horariosBackend
          .filter((h: any) => h.diaSemana === dia.nombre)
          .map((h: any) => ({
            id: h.idDisponibilidad,  // ✅ usamos el ID real del backend
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
            tipo: h.nombreTurno as 'consulta' | 'urgencias' | 'procedimiento' | 'descanso',
            activo: h.diaActivo ?? true
          }));

        if (horariosDelDia.length > 0) {
          dia.horarios = horariosDelDia;
          dia.activo = true;
        }
      });

      console.log("Horarios cargados desde backend:", this.diasSemana);
      // Opcional: actualizar localStorage
      localStorage.setItem(this.getHorariosKey(), JSON.stringify(this.diasSemana));
    },
    error: (err) => {
      console.error("Error cargando horarios del backend:", err);
      alert("No se pudieron cargar los horarios del backend");
    }
  });
}



  agregarHorario() {
  if (!this.doctorActual) return;

  const diaId = typeof this.diaSeleccionado === 'string' ? parseInt(this.diaSeleccionado) : this.diaSeleccionado;
  const dia = this.diasSemana.find(d => d.id === diaId);
  if (!dia) {
    console.log('Día no encontrado');
    return;
  }

  const horario: HorarioBloque = { ...this.nuevoHorario };

  if (!this.validarHorario(horario, dia)) {
    console.log('Horario inválido, no se agrega');
    return;
  }

  // Payload para backend
  const payload = {
    idMedico: this.doctorActual.id,
    diaSemana: dia.nombre,
    horaInicio: horario.horaInicio,
    horaFin: horario.horaFin,
    estado: 'Disponible',
    nombreTurno: horario.tipo,
    vigencia: true,
    diaActivo: true,
    duracionMinutos: 30
  };

  this.medicosService.crearDisponibilidad(payload).subscribe({
    next: (res: any) => {
      // Agregar horario con el ID real del backend
      dia.horarios.push({
        id: res.data.idDisponibilidad,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
        tipo: horario.tipo,
        activo: true
      });

      // Ordenar horarios por horaInicio
      dia.horarios.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

      this.resetearFormulario();
      localStorage.setItem(this.getHorariosKey(), JSON.stringify(this.diasSemana));
      console.log('Horario agregado y guardado en backend');
    },
    error: (err) => {
      console.error('Error agregando horario en backend:', err);
      alert('No se pudo agregar el horario en el backend');
    }
  });
}






  validarHorario(horario: HorarioBloque, dia: DiaSemana): boolean {
  // Validar que la hora de inicio sea menor que la hora de fin
  if (horario.horaInicio >= horario.horaFin) {
    alert('La hora de inicio debe ser menor que la hora de fin');
    return false;
  }

 const solapamiento = dia.horarios.some(h => {
  const hInicio = this.convertirHoraAMinutos(h.horaInicio);
  const hFin = this.convertirHoraAMinutos(h.horaFin);
  const nInicio = this.convertirHoraAMinutos(horario.horaInicio);
  const nFin = this.convertirHoraAMinutos(horario.horaFin);
  return hInicio < nFin && nInicio < hFin;
});


  if (solapamiento) {
    alert('El horario se solapa con otro horario existente');
    return false;
  }

  return true;
}

  
eliminarHorario(diaId: number, horarioId: number) {
  const dia = this.diasSemana.find(d => d.id === diaId);
  if (!dia) return;

  this.medicosService.eliminarHorario(horarioId).subscribe({
    next: () => {
      // eliminamos del UI solo si backend respondió OK
      dia.horarios = dia.horarios.filter(h => h.id !== horarioId);
      // opcional: actualizar localStorage
      localStorage.setItem(this.getHorariosKey(), JSON.stringify(this.diasSemana));
      console.log("Horario eliminado correctamente");
    },
    error: (err) => {
      console.error("Error eliminando horario:", err);
      alert("No se pudo eliminar el horario. Puede que ya no exista en la base de datos.");
    }
  });
}


  toggleDia(diaId: number) {
    const dia = this.diasSemana.find((d) => d.id === diaId);
    if (dia) {
      dia.activo = !dia.activo;
    }
  }

  guardarHorarios() {
    if (this.doctorActual) {
      this.guardandoHorarios = true;

      setTimeout(() => {
        localStorage.setItem(this.getHorariosKey(), JSON.stringify(this.diasSemana));
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
      activo: true,
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
    const tipoObj = this.tiposHorario.find((t) => t.value === tipo);
    return tipoObj ? tipoObj.color : 'primary';
  }

  obtenerNombreCompleto(): string {
    if (!this.doctorActual) return 'Doctor';
    return `Dr. ${this.doctorActual.nombre} ${this.doctorActual.apellidoPaterno || ''}`.trim();
  }

  calcularTotalHoras(dia: DiaSemana): string {
    if (!dia.activo || dia.horarios.length === 0) return '0h';

    let totalMinutos = 0;
    dia.horarios.forEach((horario) => {
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
    const tipoObj = this.tiposHorario.find((t) => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  obtenerDiasActivos(): number {
    return this.diasSemana.filter((d) => d.activo).length;
  }

  obtenerBloquesConsulta(): number {
    return this.diasSemana.reduce(
      (total, dia) => total + dia.horarios.filter((h) => h.tipo === 'consulta').length,
      0
    );
  }

  obtenerBloquesProcedimiento(): number {
    return this.diasSemana.reduce(
      (total, dia) => total + dia.horarios.filter((h) => h.tipo === 'procedimiento').length,
      0
    );
  }

  obtenerBloquesUrgencias(): number {
    return this.diasSemana.reduce(
      (total, dia) => total + dia.horarios.filter((h) => h.tipo === 'urgencias').length,
      0
    );
  }

  tieneDiasConHorarios(diaActual: DiaSemana): boolean {
    return this.diasSemana.some((d) => d.id !== diaActual.id && d.horarios.length > 0);
  }

  // Cálculos de horas mensuales
  obtenerHorasSemanalesTotales(): number {
    let totalMinutos = 0;
    this.diasSemana.forEach((dia) => {
      if (dia.activo) {
        dia.horarios.forEach((horario) => {
          if (horario.tipo !== 'descanso') {
            const inicio = this.convertirHoraAMinutos(horario.horaInicio);
            const fin = this.convertirHoraAMinutos(horario.horaFin);
            totalMinutos += fin - inicio;
          }
        });
      }
    });
    return Math.round((totalMinutos / 60) * 100) / 100; // Redondear a 2 decimales
  }

  obtenerHorasMensuales(): number {
    return Math.round(this.obtenerHorasSemanalesTotales() * 4.33 * 100) / 100; // Promedio de semanas por mes
  }

  obtenerHorasConsultaMensual(): number {
    let totalMinutos = 0;
    this.diasSemana.forEach((dia) => {
      if (dia.activo) {
        dia.horarios.forEach((horario) => {
          if (horario.tipo === 'consulta') {
            const inicio = this.convertirHoraAMinutos(horario.horaInicio);
            const fin = this.convertirHoraAMinutos(horario.horaFin);
            totalMinutos += fin - inicio;
          }
        });
      }
    });
    return Math.round((totalMinutos / 60) * 4.33 * 100) / 100;
  }

  obtenerHorasUrgenciasMensual(): number {
    let totalMinutos = 0;
    this.diasSemana.forEach((dia) => {
      if (dia.activo) {
        dia.horarios.forEach((horario) => {
          if (horario.tipo === 'urgencias') {
            const inicio = this.convertirHoraAMinutos(horario.horaInicio);
            const fin = this.convertirHoraAMinutos(horario.horaFin);
            totalMinutos += fin - inicio;
          }
        });
      }
    });
    return Math.round((totalMinutos / 60) * 4.33 * 100) / 100;
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

  private getHorariosKey(): string {
    const correo = this.doctorActual?.correo || '';
    if (correo) return `horarios_doctor:${correo}`;
    return `horarios_doctor_id:${this.doctorActual?.id || 0}`;
  }
}


// VM mínimo para el doctor actual
interface DoctorVM {
  id: number;
  nombre: string;
  apellidoPaterno?: string;
  correo: string;
  especialidad?: string;
}

