import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { HorarioService, BloqueHorario } from '../../../../../core/services/logic/horario.service';
import { MedicoService } from '../../../../../core/services/rol/medico.service';

@Component({
  selector: 'app-gestion-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './gestion-horarios.component.html',
  styleUrls: ['./gestion-horarios.component.css'],
})
export class GestionHorariosComponent implements OnInit {
  // Datos para la tabla
  horarios: HorarioVM[] = [];
  isLoading = false;
  
  // Modal de agregar/editar
  mostrarModal = false;
  modoEdicion = false;
  horarioActual: HorarioFormData | null = null;
  
  // Lista de médicos para el selector
  medicos: any[] = [];
  
  // Visualización de bloques generados
  bloquesGenerados: BloqueGenerado[] = [];
  mostrarBloques = false;

  constructor(
    private horarioService: HorarioService,
    private medicoService: MedicoService
  ) {}

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'nombreMedico', label: 'Médico', sortable: true },
    { key: 'especialidad', label: 'Especialidad', sortable: true },
    { key: 'diasSemana', label: 'Días', sortable: false },
    { key: 'horaInicio', label: 'Hora Inicio', sortable: true },
    { key: 'horaFin', label: 'Hora Fin', sortable: true },
    { key: 'duracionBloque', label: 'Duración (min)', sortable: true },
    { key: 'bloquesTotales', label: 'Bloques', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true }
  ];

  actions: TableAction[] = [
    {
      action: 'view',
      label: 'Ver Bloques',
      icon: 'fa fa-calendar-alt',
      class: 'btn-view'
    },
    {
      action: 'toggle',
      label: 'Cambiar Estado',
      icon: 'fa fa-toggle-on',
      class: 'btn-toggle'
    },
    {
      action: 'edit',
      label: 'Editar',
      icon: 'fa fa-edit',
      class: 'btn-edit'
    },
    {
      action: 'delete',
      label: 'Eliminar',
      icon: 'fa fa-trash',
      class: 'btn-delete'
    }
  ];

  ngOnInit(): void {
    this.cargarMedicos();
    this.cargarHorarios();
  }

  cargarMedicos(): void {
    this.medicoService.getMedicos().subscribe({
      next: (lista) => {
        this.medicos = lista.map((m: any) => ({
          id: m.idMedico,
          nombre: `${m.persona?.nombre1 || ''} ${m.persona?.apellidoPaterno || ''}`.trim(),
          especialidad: m.especialidad
        }));
      },
      error: (err) => console.error('Error cargando médicos:', err)
    });
  }

  cargarHorarios(): void {
    this.isLoading = true;
    // Simulación temporal - reemplazar con endpoint real
    setTimeout(() => {
      this.horarios = this.obtenerHorariosEjemplo();
      this.isLoading = false;
    }, 500);
  }

  private obtenerHorariosEjemplo(): HorarioVM[] {
    return [
      {
        id: 1,
        idMedico: 1,
        nombreMedico: 'Dr. Juan Pérez',
        especialidad: 'Cardiología',
        diasSemana: 'Lun, Mié, Vie',
        horaInicio: '09:00',
        horaFin: '17:00',
        duracionBloque: 30,
        bloquesTotales: 48,
        estado: 'Disponible'
      },
      {
        id: 2,
        idMedico: 2,
        nombreMedico: 'Dra. María González',
        especialidad: 'Dermatología',
        diasSemana: 'Mar, Jue',
        horaInicio: '14:00',
        horaFin: '20:00',
        duracionBloque: 25,
        bloquesTotales: 28,
        estado: 'No Disponible'
      },
      {
        id: 3,
        idMedico: 3,
        nombreMedico: 'Dr. Carlos Mendoza',
        especialidad: 'Pediatría',
        diasSemana: 'Lun, Mar, Mié, Jue, Vie',
        horaInicio: '08:00',
        horaFin: '14:00',
        duracionBloque: 20,
        bloquesTotales: 54,
        estado: 'Disponible'
      },
      {
        id: 4,
        idMedico: 4,
        nombreMedico: 'Dra. Ana Torres',
        especialidad: 'Ginecología',
        diasSemana: 'Lun, Mié, Vie',
        horaInicio: '10:00',
        horaFin: '18:00',
        duracionBloque: 30,
        bloquesTotales: 48,
        estado: 'Disponible'
      },
      {
        id: 5,
        idMedico: 5,
        nombreMedico: 'Dr. Luis Ramírez',
        especialidad: 'Traumatología',
        diasSemana: 'Mar, Jue, Sáb',
        horaInicio: '09:00',
        horaFin: '16:00',
        duracionBloque: 25,
        bloquesTotales: 40,
        estado: 'No Disponible'
      },
      {
        id: 6,
        idMedico: 6,
        nombreMedico: 'Dra. Sofia Vargas',
        especialidad: 'Oftalmología',
        diasSemana: 'Lun, Mié, Vie',
        horaInicio: '13:00',
        horaFin: '19:00',
        duracionBloque: 15,
        bloquesTotales: 72,
        estado: 'Disponible'
      },
      {
        id: 7,
        idMedico: 7,
        nombreMedico: 'Dr. Roberto Silva',
        especialidad: 'Neurología',
        diasSemana: 'Mar, Jue',
        horaInicio: '08:00',
        horaFin: '15:00',
        duracionBloque: 45,
        bloquesTotales: 28,
        estado: 'Disponible'
      },
      {
        id: 8,
        idMedico: 8,
        nombreMedico: 'Dra. Patricia Rojas',
        especialidad: 'Endocrinología',
        diasSemana: 'Lun, Mié, Vie',
        horaInicio: '11:00',
        horaFin: '17:00',
        duracionBloque: 30,
        bloquesTotales: 36,
        estado: 'No Disponible'
      }
    ];
  }

  agregarHorario(): void {
    this.modoEdicion = false;
    this.horarioActual = {
      idMedico: 0,
      diasSemana: [],
      horaInicio: '08:00',
      horaFin: '17:00',
      duracionBloque: 30,
      fechaInicio: this.obtenerFechaHoy(),
      fechaFin: this.obtenerFechaEnDias(90)
    };
    this.mostrarModal = true;
    this.bloquesGenerados = [];
  }

  editarHorario(horario: HorarioVM): void {
    this.modoEdicion = true;
    this.horarioActual = {
      id: horario.id,
      idMedico: horario.idMedico,
      diasSemana: horario.diasSemana.split(', ').map(d => this.mapDiaAbrevToFull(d)),
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      duracionBloque: horario.duracionBloque,
      fechaInicio: this.obtenerFechaHoy(),
      fechaFin: this.obtenerFechaEnDias(90)
    };
    this.mostrarModal = true;
    this.generarVistaPrevia();
  }

  verBloques(horario: HorarioVM): void {
    this.horarioActual = {
      idMedico: horario.idMedico,
      diasSemana: horario.diasSemana.split(', ').map(d => this.mapDiaAbrevToFull(d)),
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      duracionBloque: horario.duracionBloque,
      fechaInicio: this.obtenerFechaHoy(),
      fechaFin: this.obtenerFechaEnDias(14)
    };
    this.generarVistaPrevia();
    this.mostrarBloques = true;
  }

  generarVistaPrevia(): void {
    if (!this.horarioActual) return;

    const bloques: BloqueGenerado[] = [];
    const fechaInicio = new Date(this.horarioActual.fechaInicio);
    const fechaFin = new Date(this.horarioActual.fechaFin);
    
    let fechaActual = new Date(fechaInicio);
    let contador = 1;

    while (fechaActual <= fechaFin) {
      const diaSemana = this.obtenerDiaSemana(fechaActual);
      
      if (this.horarioActual.diasSemana.includes(diaSemana)) {
        const bloquesDelDia = this.generarBloquesDia(
          fechaActual,
          this.horarioActual.horaInicio,
          this.horarioActual.horaFin,
          this.horarioActual.duracionBloque
        );
        
        bloquesDelDia.forEach(bloque => {
          bloques.push({
            id: contador++,
            fecha: bloque.fecha,
            diaSemana: bloque.diaSemana,
            horaInicio: bloque.horaInicio,
            horaFin: bloque.horaFin,
            disponible: true
          });
        });
      }
      
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    this.bloquesGenerados = bloques;
  }

  private generarBloquesDia(fecha: Date, horaInicio: string, horaFin: string, duracion: number): any[] {
    const bloques = [];
    const [horaI, minI] = horaInicio.split(':').map(Number);
    const [horaF, minF] = horaFin.split(':').map(Number);
    
    let minutosActual = horaI * 60 + minI;
    const minutosFin = horaF * 60 + minF;
    
    while (minutosActual + duracion <= minutosFin) {
      const hInicio = Math.floor(minutosActual / 60);
      const mInicio = minutosActual % 60;
      const hFin = Math.floor((minutosActual + duracion) / 60);
      const mFin = (minutosActual + duracion) % 60;
      
      bloques.push({
        fecha: fecha.toISOString().split('T')[0],
        diaSemana: this.obtenerDiaSemana(fecha),
        horaInicio: `${String(hInicio).padStart(2, '0')}:${String(mInicio).padStart(2, '0')}`,
        horaFin: `${String(hFin).padStart(2, '0')}:${String(mFin).padStart(2, '0')}`
      });
      
      minutosActual += duracion;
    }
    
    return bloques;
  }

  guardarHorario(): void {
    if (!this.horarioActual) return;

    // TODO: Conectar con endpoint POST/PUT
    const payload = {
      idMedico: this.horarioActual.idMedico,
      diasSemana: this.horarioActual.diasSemana,
      horaInicio: this.horarioActual.horaInicio,
      horaFin: this.horarioActual.horaFin,
      duracionBloque: this.horarioActual.duracionBloque,
      fechaInicio: this.horarioActual.fechaInicio,
      fechaFin: this.horarioActual.fechaFin,
      bloques: this.bloquesGenerados
    };

    console.log('📤 Payload a enviar:', payload);
    
    // Simulación temporal
    alert(`✅ Horario ${this.modoEdicion ? 'actualizado' : 'creado'} exitosamente\n\nBloques generados: ${this.bloquesGenerados.length}`);
    this.cancelarFormulario();
    this.cargarHorarios();
  }

  eliminarHorario(horario: HorarioVM): void {
    const confirmacion = confirm(`¿Eliminar horario del ${horario.nombreMedico}?`);
    
    if (confirmacion) {
      // TODO: Conectar con endpoint DELETE
      console.log('🗑️ Eliminar horario ID:', horario.id);
      alert('✅ Horario eliminado');
      this.cargarHorarios();
    }
  }

  cancelarFormulario(): void {
    this.mostrarModal = false;
    this.mostrarBloques = false;
    this.horarioActual = null;
    this.bloquesGenerados = [];
  }

  cambiarEstado(horario: HorarioVM): void {
    const nuevoEstado = horario.estado === 'Disponible' ? 'No Disponible' : 'Disponible';
    const confirmacion = confirm(`¿Cambiar estado del horario de ${horario.nombreMedico} a "${nuevoEstado}"?`);
    
    if (confirmacion) {
      // TODO: Conectar con endpoint PATCH /api/horarios/{id}/estado
      const payload = {
        estado: nuevoEstado
      };
      
      console.log('🔄 Cambiar estado horario ID:', horario.id, 'a:', nuevoEstado);
      
      // Actualizar localmente
      const index = this.horarios.findIndex(h => h.id === horario.id);
      if (index > -1) {
        this.horarios[index].estado = nuevoEstado;
      }
      
      alert(`✅ Estado cambiado a "${nuevoEstado}"`);
    }
  }

  onTableAction(event: { action: string, item: any }): void {
    const horario = event.item as HorarioVM;
    
    switch (event.action) {
      case 'view':
        this.verBloques(horario);
        break;
      case 'toggle':
        this.cambiarEstado(horario);
        break;
      case 'edit':
        this.editarHorario(horario);
        break;
      case 'delete':
        this.eliminarHorario(horario);
        break;
    }
  }

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
    console.log('🔄 Ordenar por:', event.column, event.direction);
  }

  // Utilidades
  private obtenerFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private obtenerFechaEnDias(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
  }

  private obtenerDiaSemana(fecha: Date): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[fecha.getDay()];
  }

  private mapDiaAbrevToFull(abrev: string): string {
    const map: any = {
      'Lun': 'Lunes', 'Mar': 'Martes', 'Mié': 'Miércoles',
      'Jue': 'Jueves', 'Vie': 'Viernes', 'Sáb': 'Sábado', 'Dom': 'Domingo'
    };
    return map[abrev] || abrev;
  }

  toggleDia(dia: string): void {
    if (!this.horarioActual) return;
    
    const index = this.horarioActual.diasSemana.indexOf(dia);
    if (index > -1) {
      this.horarioActual.diasSemana.splice(index, 1);
    } else {
      this.horarioActual.diasSemana.push(dia);
    }
  }

  isDiaSeleccionado(dia: string): boolean {
    return this.horarioActual?.diasSemana.includes(dia) || false;
  }

  get medicoSeleccionado(): any {
    return this.medicos.find(m => m.id === this.horarioActual?.idMedico);
  }

  get bloquesAgrupadosPorDia(): any[] {
    const grupos: any = {};
    
    this.bloquesGenerados.forEach(bloque => {
      const key = `${bloque.fecha} - ${bloque.diaSemana}`;
      if (!grupos[key]) {
        grupos[key] = {
          fecha: bloque.fecha,
          diaSemana: bloque.diaSemana,
          bloques: []
        };
      }
      grupos[key].bloques.push(bloque);
    });
    
    return Object.values(grupos);
  }
}

// Interfaces
interface HorarioVM {
  id: number;
  idMedico: number;
  nombreMedico: string;
  especialidad: string;
  diasSemana: string;
  horaInicio: string;
  horaFin: string;
  duracionBloque: number;
  bloquesTotales: number;
  estado: 'Disponible' | 'No Disponible';
}

interface HorarioFormData {
  id?: number;
  idMedico: number;
  diasSemana: string[];
  horaInicio: string;
  horaFin: string;
  duracionBloque: number;
  fechaInicio: string;
  fechaFin: string;
}

interface BloqueGenerado {
  id: number;
  fecha: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
}
