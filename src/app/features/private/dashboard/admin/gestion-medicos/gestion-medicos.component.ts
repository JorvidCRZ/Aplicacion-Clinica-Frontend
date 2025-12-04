import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { Medico } from '../../../../../core/models/users/medico';
import { MedicoService } from '../../../../../core/services/rol/medico.service';
import { ReportesService } from '../../../../../core/services/logic/reportes.service';

@Component({
  selector: 'app-gestion-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './gestion-medicos.component.html',
  styleUrls: ['./gestion-medicos.component.css']
})
export class GestionMedicosComponent implements OnInit {
  doctores: DoctorVM[] = [];
  doctoresLocales: DoctorVM[] = []; // Solo médicos locales
  isLoading = false;
  mostrarModalVer = false;
  mostrarFormulario = false; // Para mostrar formulario de agregar/editar
  doctorActual: DoctorVM | null = null;
  modoEdicion = false;
  
  constructor(
    private medicoService: MedicoService, 
    private reportesService: ReportesService
  ) {}

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'apellidoPaterno', label: 'Apellido Paterno', sortable: true },
    { key: 'apellidoMaterno', label: 'Apellido Materno', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'especialidad', label: 'Especialidad', sortable: true },
    { key: 'nroColegiado', label: 'Nro. Colegiado', sortable: true },
    { key: 'telefono', label: 'Teléfono', sortable: false },
    { key: 'horario', label: 'Horario', sortable: false }
  ];

  actions: TableAction[] = [
    {
      action: 'view',
      label: 'Ver',
      icon: 'fa fa-eye',
      class: 'btn-view'
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

  especialidades = [
    { id: 0, nombre: 'Medicina General', descripcion: 'Atención primaria y preventiva para todas las edades.' },
    { id: 1, nombre: 'Cardiología', descripcion: 'Cuidado del corazón y sistema circulatorio.' },
    { id: 2, nombre: 'Dermatología', descripcion: 'Tratamiento de la piel, cabello y uñas.' },
    { id: 3, nombre: 'Pediatría', descripcion: 'Atención médica para niños y adolescentes.' },
    { id: 4, nombre: 'Ginecología', descripcion: 'Salud reproductiva y sistema femenino.' },
    { id: 5, nombre: 'Traumatología', descripcion: 'Lesiones óseas, musculares y articulares.' },
    { id: 6, nombre: 'Oftalmología', descripcion: 'Diagnóstico y tratamiento de problemas oculares.' },
    { id: 7, nombre: 'Odontología', descripcion: 'Salud dental y cuidado bucal.' },
    { id: 8, nombre: 'Neurología', descripcion: 'Sistema nervioso y trastornos neurológicos.' },
    { id: 9, nombre: 'Endocrinología', descripcion: 'Glándulas y hormonas en el cuerpo.' },
    { id: 10, nombre: 'Reumatología', descripcion: 'Enfermedades de articulaciones y tejidos blandos.' },
    { id: 11, nombre: 'Psiquiatría', descripcion: 'Salud mental y emocional.' },
    { id: 12, nombre: 'Urología', descripcion: 'Sistema urinario y aparato reproductor masculino.' }
  ];

  ngOnInit(): void {
    this.cargarDoctoresBackend();
    this.cargarDoctoresLocales();
  }

  // Cargar médicos desde backend
  cargarDoctoresBackend(): void {
    this.isLoading = true;
    this.medicoService.getAll().subscribe({
      next: (lista: Medico[]) => {
        const doctoresBackend = (lista || []).map(m => this.mapMedicoToVM(m));
        this.doctores = [...doctoresBackend];
        // Combinar con locales
        this.combinarDoctores();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando médicos del backend:', error);
        // Solo cargar locales si falla backend
        this.doctores = [...this.doctoresLocales];
        this.isLoading = false;
      }
    });
  }

  // Cargar médicos locales
  private cargarDoctoresLocales(): void {
    const doctoresStr = localStorage.getItem('medicos_locales');
    if (doctoresStr) {
      this.doctoresLocales = JSON.parse(doctoresStr);
      this.doctoresLocales.forEach(d => d.esLocal = true);
    }
  }

  // Guardar médicos locales
  private guardarDoctoresLocales(): void {
    localStorage.setItem('medicos_locales', JSON.stringify(this.doctoresLocales));
  }

  // Combinar médicos del backend con locales
  private combinarDoctores(): void {
    const idsBackend = this.doctores.filter(d => !d.esLocal).map(d => d.id);
    this.doctoresLocales = this.doctoresLocales.filter(local => 
      !idsBackend.includes(local.id)
    );
    
    const todosDoctores = [
      ...this.doctores.filter(d => !d.esLocal),
      ...this.doctoresLocales
    ];
    
    this.doctores = todosDoctores;
  }

  // Botón de agregar médico - FUNCIONA LOCALMENTE
  agregarDoctor(): void {
    this.modoEdicion = false;
    this.doctorActual = {
      id: this.generarNuevoId(),
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      telefono: '',
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      especialidad: '',
      nroColegiado: '',
      horario: '',
      esLocal: true // IMPORTANTE: Marcar como local
    };
    this.mostrarFormulario = true;
    console.log('Agregando médico localmente...');
  }

  // Generar ID único positivo
  private generarNuevoId(): number {
    const idsBackend = this.doctores.filter(d => !d.esLocal).map(d => d.id);
    const idsLocales = this.doctoresLocales.map(d => d.id);
    const todosIds = [...idsBackend, ...idsLocales];
    
    if (todosIds.length === 0) return 1000;
    
    const maxId = Math.max(...todosIds);
    return maxId + 1;
  }

  onTableAction(event: { action: string, item: any }): void {
    const doctor = event.item as DoctorVM;
    
    switch (event.action) {
      case 'view':
        this.verDoctor(doctor);
        break;
      case 'edit':
        this.editarDoctor(doctor);
        break;
      case 'delete':
        this.eliminarDoctor(doctor);
        break;
      default:
        console.log('Acción no reconocida:', event.action);
    }
  }

  private verDoctor(doctor: DoctorVM): void {
    this.doctorActual = { ...doctor };
    this.mostrarModalVer = true;
  }

  editarDoctor(doctor: DoctorVM): void {
    this.modoEdicion = true;
    this.doctorActual = { ...doctor };
    this.mostrarFormulario = true;
  }

  // Guardar médico (LOCAL para nuevos, según origen para ediciones)
  guardarDoctor(): void {
    if (!this.doctorActual) return;
    
    // Validar campos obligatorios
    if (!this.doctorActual.email || String(this.doctorActual.email).trim().length === 0) {
      alert('El email es obligatorio.');
      return;
    }
    
    if (!this.doctorActual.nombre || String(this.doctorActual.nombre).trim().length === 0) {
      alert('El nombre es obligatorio.');
      return;
    }

    if (!this.doctorActual.especialidad || String(this.doctorActual.especialidad).trim().length === 0) {
      alert('La especialidad es obligatoria.');
      return;
    }

    if (!this.doctorActual.nroColegiado || String(this.doctorActual.nroColegiado).trim().length === 0) {
      alert('El número de colegiado es obligatorio.');
      return;
    }

    if (this.modoEdicion) {
      // EDITAR médico
      if (this.doctorActual.esLocal) {
        // Actualizar en lista local
        this.doctoresLocales = this.doctoresLocales.map(d =>
          d.id === this.doctorActual?.id 
            ? { ...this.doctorActual! }
            : d
        );
        
        this.guardarDoctoresLocales();
        alert("✅ Médico actualizado");
      } else {
        // Intentar actualizar en backend
        this.actualizarEnBackend();
        return;
      }
      
    } else {
      // CREAR nuevo médico LOCAL (NO se envía al backend)
      const nuevoDoctor: DoctorVM = { 
        ...this.doctorActual,
        id: this.generarNuevoId(),
        esLocal: true
      };
      
      // Agregar a lista local
      this.doctoresLocales.push(nuevoDoctor);
      this.guardarDoctoresLocales();
      
      alert("✅ Médico agregado localmente");
    }
    
    // Actualizar lista combinada
    this.combinarDoctores();
    
    // Limpiar formulario
    this.cancelarFormulario();
  }

  // Actualizar médico en backend (solo para ediciones de médicos del backend)
  private actualizarEnBackend(): void {
    if (!this.doctorActual) return;

    const payload = this.mapVMToUpdate(this.doctorActual);
    
    this.medicoService.update(this.doctorActual.id, payload).subscribe({
      next: () => {
        // Actualizar en lista local
        this.doctores = this.doctores.map(d =>
          d.id === this.doctorActual?.id 
            ? { ...this.doctorActual! }
            : d
        );
        
        alert("✅ Médico actualizado en el sistema");
        this.cancelarFormulario();
        
        // Recargar desde backend
        setTimeout(() => this.cargarDoctoresBackend(), 500);
      },
      error: (error) => {
        console.error('Error actualizando en backend:', error);
        alert("⚠️ No se pudo actualizar en el sistema. Los cambios son locales.");
        
        // Actualizar localmente como fallback
        this.doctores = this.doctores.map(d =>
          d.id === this.doctorActual?.id 
            ? { ...this.doctorActual! }
            : d
        );
        
        this.cancelarFormulario();
      }
    });
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.mostrarModalVer = false;
    this.doctorActual = null;
    this.modoEdicion = false;
  }

  // Eliminar médico
  private eliminarDoctor(doctor: DoctorVM): void {
    const confirmacion = confirm(`¿Estás seguro de eliminar al doctor ${doctor.nombre}?`);
    
    if (!confirmacion) return;

    if (doctor.esLocal) {
      // Eliminar local
      this.doctoresLocales = this.doctoresLocales.filter(d => d.id !== doctor.id);
      this.guardarDoctoresLocales();
      this.combinarDoctores();
      alert("✅ Médico local eliminado");
    } else {
      // Eliminar del backend
      this.medicoService.delete(doctor.id).subscribe({
        next: () => {
          this.doctores = this.doctores.filter(d => d.id !== doctor.id);
          alert("✅ Médico eliminado del sistema");
        },
        error: (error) => {
          console.error('Error eliminando médico:', error);
          alert("❌ Error al eliminar el médico");
        }
      });
    }
  }

  // FUNCIÓN DE DESCARGAR PDF - SE MANTIENE IGUAL
  descargarReporteMedicosPDF(): void {
    this.reportesService.descargarMedicos('pdf').subscribe({
      next: (blob: Blob) => {
        const filename = 'reporte-medicos.pdf';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Error descargando reporte de médicos:', err);
        alert('No se pudo descargar el reporte de médicos. Revisa la consola.');
      }
    });
  }

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
    console.log('🔄 Ordenar por:', event.column, event.direction);
  }

  // Mapeo desde modelo Medico
  private mapMedicoToVM(m: Medico): DoctorVM {
    return {
      id: m.idMedico,
      nombre: m.persona?.nombre1 || '',
      apellidoPaterno: m.persona?.apellidoPaterno || '',
      apellidoMaterno: m.persona?.apellidoMaterno || '',
      email: m.persona?.usuario?.correo || m.email || '',
      telefono: m.persona?.telefono || '',
      tipoDocumento: m.persona?.tipoDocumento || '',
      numeroDocumento: m.persona?.dni || '',
      especialidad: m.especialidad || '',
      nroColegiado: m.colegiatura || '',
      horario: m.horario || '',
      esLocal: false // Viene del backend
    };
  }

  // Mapeo para actualizar en backend
  private mapVMToUpdate(vm: DoctorVM): any {
    return {
      nombre1: vm.nombre || '',
      nombre2: vm.nombre2 || '',
      apellidoPaterno: vm.apellidoPaterno || '',
      apellidoMaterno: vm.apellidoMaterno || '',
      dni: vm.numeroDocumento || '',
      telefono: vm.telefono || '',
      direccion: vm.direccion || '',
      genero: vm.genero || '',
      correo: vm.email || '',
      especialidad: vm.especialidad || 'Sin especialidad',
      colegiatura: vm.nroColegiado || '',
      horario: vm.horario || ''
    };
  }
}

interface DoctorVM {
  id: number;
  idPersona?: number;  
  nombre: string;
  nombre2?: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
  tipoDocumento: string; 
  numeroDocumento: string; 
  especialidad: string;
  nroColegiado: string;    
  horario: string;        
  genero?: string;
  direccion?: string;
  esLocal?: boolean; // Para diferenciar locales vs backend
}