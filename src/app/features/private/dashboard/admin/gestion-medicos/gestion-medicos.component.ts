import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { Medico } from '../../../../../core/models/users/medico';
import { MedicoService } from '../../../../../core/services/rol/medico.service';

@Component({
  selector: 'app-gestion-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './gestion-medicos.component.html',
  styleUrls: ['./gestion-medicos.component.css']
})
export class GestionMedicosComponent implements OnInit {
  // Vista de doctores para la tabla
  doctores: DoctorVM[] = [];
  isLoading = false;
  mostrarModalVer = false;
  doctorActual: DoctorVM | null = null;
  modoEdicion = false;
  
  constructor(private medicoService: MedicoService) {}

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
    this.cargarDoctores();
  }

  cargarDoctores(): void {
    this.isLoading = true;
    // Intentar cargar desde el backend primero
    this.medicoService.getAll().subscribe({
      next: (lista: Medico[]) => {
        this.doctores = (lista || []).map(m => this.mapMedicoToVM(m));
        this.isLoading = false;
      },
      error: _ => {
        // Fallback a localStorage si falla el backend
        const usuarios = this.obtenerUsuarios();
        const doctores = usuarios.filter(u => this.esDoctor(u));
        this.doctores = doctores.map(u => this.toDoctorVM(u));
        if (this.doctores.length === 0) {
          this.agregarDoctoresEjemplo();
        }
        this.isLoading = false;
      }
    });
  }

  private agregarDoctoresEjemplo(): void {
    const usuarios = this.obtenerUsuarios();
    const currentIds = usuarios.map((u: any) => u.id ?? u.idUsuario ?? 0);
    const maxId = currentIds.length ? Math.max(...currentIds) : 0;
    const nextId = maxId + 1;

    const doctoresEjemplo: DoctorVM[] = [
      {
        id: nextId,
        nombre: 'Luján',
        apellidoPaterno: 'Carrión',
        apellidoMaterno: 'García',
        email: 'doctor@gmail.com',
        telefono: '999999999',
        tipoDocumento: 'DNI',
        numeroDocumento: '87654321',
        especialidad: 'Cardiología',
        nroColegiado: 'CMP-12345',
        horario: 'Lun-Vie 8:00-16:00'
      },
      {
        id: nextId + 1,
        nombre: 'María',
        apellidoPaterno: 'González',
        apellidoMaterno: 'Ramos',
        email: 'maria.gonzalez@clinica.com',
        telefono: '987654321',
        tipoDocumento: 'DNI',
        numeroDocumento: '98765432',
        especialidad: 'Dermatología',
        nroColegiado: 'CMP-67890',
        horario: 'Mar-Sáb 9:00-17:00'
      },
      {
        id: nextId + 2,
        nombre: 'Carlos',
        apellidoPaterno: 'Mendoza',
        apellidoMaterno: 'López',
        email: 'carlos.mendoza@clinica.com',
        telefono: '956789123',
        tipoDocumento: 'DNI',
        numeroDocumento: '65432198',
        especialidad: 'Medicina General',
        nroColegiado: 'CMP-54321',
        horario: 'Lun-Vie 7:00-15:00'
      }
    ];

    // Persistir como usuarios con rol Doctor (estructura plana para admin local)
    const nuevosUsuarios = doctoresEjemplo.map(d => ({
      id: d.id,
      rol: 'doctor',
      nombre: d.nombre,
      apellidoPaterno: d.apellidoPaterno,
      apellidoMaterno: d.apellidoMaterno,
      email: d.email,
      telefono: d.telefono,
      tipoDocumento: d.tipoDocumento,
      numeroDocumento: d.numeroDocumento,
      especialidad: d.especialidad,
      nroColegiado: d.nroColegiado,
      horario: d.horario
    }));

    const actualizados = [...usuarios, ...nuevosUsuarios];
    localStorage.setItem('usuarios', JSON.stringify(actualizados));
    this.doctores = doctoresEjemplo;
  }

  private obtenerUsuarios(): any[] {
    const usuariosStr = localStorage.getItem('usuarios');
    return usuariosStr ? JSON.parse(usuariosStr) : [];
  }

  private guardarUsuarios(users: any[]): void {
    localStorage.setItem('usuarios', JSON.stringify(users));
  }

  agregarDoctor(): void {
    this.modoEdicion = false;
    this.doctorActual = {
      id: 0,
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      telefono: '',
      tipoDocumento: '',
      numeroDocumento: '',
      especialidad: '',
      nroColegiado: '',
      horario: ''
    };
  }

  editarDoctor(doctor: DoctorVM): void {
    this.modoEdicion = true;
    this.doctorActual = { ...doctor };
  }

  guardarDoctor(): void {
    if (!this.doctorActual) return;
    // Intentar persistir contra backend primero
    const payload = this.mapVMToMedico(this.doctorActual);
    if (this.modoEdicion) {
      this.medicoService.update(this.doctorActual.id, payload).subscribe({
        next: _ => { this.postSaveCleanup(); },
        error: _ => { this.saveLocalFallback(); }
      });
    } else {
      this.medicoService.add(payload).subscribe({
        next: _ => { this.postSaveCleanup(); },
        error: _ => { this.saveLocalFallback(true); }
      });
    }
  }

  verDoctor(doctor: DoctorVM): void {
    this.doctorActual = { ...doctor };
    this.mostrarModalVer = true;
  }

  cancelarFormulario(): void {
    this.mostrarModalVer = false;
    this.doctorActual = null;
    this.modoEdicion = false;
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

  private eliminarDoctor(doctor: DoctorVM): void {
    const confirmacion = confirm(`¿Estás seguro de eliminar al doctor ${doctor.nombre}?`);
    
    if (confirmacion) {
      // Intentar borrar en backend primero
      this.medicoService.delete(doctor.id).subscribe({
        next: _ => this.cargarDoctores(),
        error: _ => {
          const usuarios = this.obtenerUsuarios();
          const filtrados = usuarios.filter((u: any) => (u.id ?? u.idUsuario) !== doctor.id);
          this.guardarUsuarios(filtrados);
          this.cargarDoctores();
        }
      });
    }
  }

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
    console.log('🔄 Ordenar por:', event.column, event.direction);
  }

  // Utilidades de mapeo y detección
  private esDoctor(u: any): boolean {
    const rol = (typeof u.rol === 'string') ? u.rol : u.rol?.nombre;
    return String(rol || '').toLowerCase() === 'doctor' || String(rol || '').toLowerCase() === 'medico';
  }

  private toDoctorVM(u: any): DoctorVM {
    return {
      id: (u.id ?? u.idUsuario ?? 0),
      nombre: (u.nombre ?? u.persona?.nombre1 ?? ''),
      apellidoPaterno: (u.apellidoPaterno ?? u.persona?.apellidoPaterno ?? ''),
      apellidoMaterno: (u.apellidoMaterno ?? u.persona?.apellidoMaterno ?? ''),
      email: (u.email ?? u.correo ?? u.persona?.usuario?.correo ?? ''),
      telefono: (u.telefono ?? u.persona?.telefono ?? ''),
      tipoDocumento: (u.tipoDocumento ?? u.persona?.tipoDocumento ?? ''),
      numeroDocumento: (u.numeroDocumento ?? u.persona?.dni ?? ''),
      especialidad: (u.especialidad ?? ''),
      nroColegiado: (u.nroColegiado ?? ''),
      horario: (u.horario ?? '')
    } as DoctorVM;
  }

  private mapMedicoToVM(m: Medico): DoctorVM {
    return {
      id: m.idMedico,
      nombre: m.persona?.nombre1 || '',
      apellidoPaterno: m.persona?.apellidoPaterno || '',
      apellidoMaterno: m.persona?.apellidoMaterno || '',
      email: m.email || m.persona?.usuario?.correo || '',
      telefono: m.persona?.telefono || '',
      tipoDocumento: m.persona?.tipoDocumento || '',
      numeroDocumento: m.persona?.dni || '',
      especialidad: m.especialidad || '',
      nroColegiado: m.colegiatura || '',
      horario: m.horario || ''
    };
  }

  private mapVMToMedico(vm: DoctorVM): Medico {
    return {
      idMedico: vm.id,
      colegiatura: vm.nroColegiado || '',
      experienciaAnios: 0,
      persona: {
        tipoDocumento: vm.tipoDocumento || 'DNI',
        dni: vm.numeroDocumento || '',
        nombre1: vm.nombre || '',
        nombre2: '',
        apellidoPaterno: vm.apellidoPaterno || '',
        apellidoMaterno: vm.apellidoMaterno || '',
        fechaNacimiento: new Date().toISOString(),
        genero: 'N',
        pais: 'PE',
        departamento: '',
        provincia: '',
        distrito: '',
        direccion: '',
        telefono: vm.telefono || '',
        usuario: { correo: vm.email || '', rol: { idRol: 2, nombre: 'Medico' } as any }
      }
    } as Medico;
  }

  private postSaveCleanup() {
    this.doctorActual = null;
    this.modoEdicion = false;
    this.cargarDoctores();
  }

  private saveLocalFallback(isCreate = false) {
    const usuarios = this.obtenerUsuarios();
    if (this.doctorActual) {
      if (this.modoEdicion) {
        const idx = usuarios.findIndex((u: any) => (u.id ?? u.idUsuario) === this.doctorActual!.id);
        if (idx > -1) {
          usuarios[idx] = {
            ...usuarios[idx],
            id: this.doctorActual.id,
            rol: usuarios[idx].rol ?? 'doctor',
            nombre: this.doctorActual.nombre,
            apellidoPaterno: this.doctorActual.apellidoPaterno,
            apellidoMaterno: this.doctorActual.apellidoMaterno,
            email: this.doctorActual.email,
            telefono: this.doctorActual.telefono,
            tipoDocumento: this.doctorActual.tipoDocumento,
            numeroDocumento: this.doctorActual.numeroDocumento,
            especialidad: this.doctorActual.especialidad,
            nroColegiado: this.doctorActual.nroColegiado,
            horario: this.doctorActual.horario
          };
        }
      } else if (isCreate) {
        const currentIds = usuarios.map((u: any) => u.id ?? u.idUsuario ?? 0);
        const maxId = currentIds.length ? Math.max(...currentIds) : 0;
        const nuevo: any = {
          id: maxId + 1,
          rol: 'doctor',
          nombre: this.doctorActual.nombre,
          apellidoPaterno: this.doctorActual.apellidoPaterno,
          apellidoMaterno: this.doctorActual.apellidoMaterno,
          email: this.doctorActual.email,
          telefono: this.doctorActual.telefono,
          tipoDocumento: this.doctorActual.tipoDocumento,
          numeroDocumento: this.doctorActual.numeroDocumento,
          especialidad: this.doctorActual.especialidad,
          nroColegiado: this.doctorActual.nroColegiado,
          horario: this.doctorActual.horario
        };
        usuarios.push(nuevo);
      }
      this.guardarUsuarios(usuarios);
    }
    this.postSaveCleanup();
  }
}

// Modelo de vista para doctores en el admin
interface DoctorVM {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  especialidad: string;
  nroColegiado: string;
  horario: string;
}

// Nota: se soporta tanto la estructura plana como la basada en Usuario/Persona
