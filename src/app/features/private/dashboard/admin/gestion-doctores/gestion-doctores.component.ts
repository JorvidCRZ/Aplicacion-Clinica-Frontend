import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { Doctor } from '../../../../../core/models/users/doctor';
import { Usuario } from '../../../../../core/models/users/usuario';
import { DoctorService } from '../../../../../core/services/doctor.service';

@Component({
  selector: 'app-gestion-doctores',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './gestion-doctores.component.html',
  styleUrls: ['./gestion-doctores.component.css']
})
export class GestionDoctoresComponent implements OnInit {
  doctores: Doctor[] = [];
  isLoading = false;
  mostrarModalVer = false;
  doctorActual: Doctor | null = null;
  modoEdicion = false;
  doctorService = new DoctorService();

  // 📋 Configuración de columnas para la tabla
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

  // 🎯 Configuración de acciones para cada fila
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

  // 📊 Cargar datos de doctores desde localStorage
  cargarDoctores(): void {
    this.isLoading = true;
    
    // Simular delay de carga
    setTimeout(() => {
      const usuarios = this.obtenerUsuarios();
      this.doctores = usuarios.filter(u => u.rol === 'doctor') as Doctor[];
      
      // Agregar doctores de ejemplo si no existen
      if (this.doctores.length === 0) {
        this.agregarDoctoresEjemplo();
      }
      
      this.isLoading = false;
    }, 500);
  }

  // 👨‍⚕️ Agregar doctores de ejemplo
  private agregarDoctoresEjemplo(): void {
    const usuarios = this.obtenerUsuarios();
    const nextId = Math.max(...usuarios.map(u => u.id), 0) + 1;
    
    const doctoresEjemplo: Doctor[] = [
      {
        id: nextId,
        nombre: 'Luján',
        apellidoPaterno: 'Carrión',
        apellidoMaterno: 'García',
        email: 'doctor@gmail.com',
        telefono: '999999999',
        password: 'doctor123',
        rol: 'doctor',
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
        password: 'maria123',
        rol: 'doctor',
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
        password: 'carlos123',
        rol: 'doctor',
        tipoDocumento: 'DNI',
        numeroDocumento: '65432198',
        especialidad: 'Medicina General',
        nroColegiado: 'CMP-54321',
        horario: 'Lun-Vie 7:00-15:00'
      }
    ];
    
    usuarios.push(...doctoresEjemplo);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    this.doctores = doctoresEjemplo;
  }

  // 📂 Obtener usuarios desde localStorage
  private obtenerUsuarios(): Usuario[] {
    const usuariosStr = localStorage.getItem('usuarios');
    return usuariosStr ? JSON.parse(usuariosStr) : [];
  }

  // ➕ Agregar nuevo doctor
  agregarDoctor(): void {
    this.modoEdicion = false;
    this.doctorActual = {
      id: 0,
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      telefono: '',
      password: '',
      rol: 'doctor',
      tipoDocumento: '',
      numeroDocumento: '',
      especialidad: '',
      nroColegiado: '',
      horario: ''
    };
  }

  editarDoctor(doctor: Doctor): void {
    this.modoEdicion = true;
    this.doctorActual = { ...doctor };
  }

  guardarDoctor(): void {
    if (!this.doctorActual) return;
    if (this.modoEdicion) {
      this.doctorService.update(this.doctorActual);
    } else {
      this.doctorService.add(this.doctorActual);
    }
    this.doctorActual = null;
    this.modoEdicion = false;
    this.cargarDoctores();
  }

  verDoctor(doctor: Doctor): void {
    this.doctorActual = { ...doctor };
    this.mostrarModalVer = true;
  }

  cancelarFormulario(): void {
    this.mostrarModalVer = false;
    this.doctorActual = null;
    this.modoEdicion = false;
  }

  // 🎯 Manejar acciones de la tabla
  onTableAction(event: { action: string, item: any }): void {
    const doctor = event.item as Doctor;
    
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

  // 🗑️ Eliminar doctor
  private eliminarDoctor(doctor: Doctor): void {
    const confirmacion = confirm(`¿Estás seguro de eliminar al doctor ${doctor.nombre}?`);
    
    if (confirmacion) {
      this.doctorService.delete(doctor.id);
      this.cargarDoctores();
    }
  }

  // 🔄 Manejar cambios de ordenamiento
  onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
    console.log('🔄 Ordenar por:', event.column, event.direction);
    // El DataTableComponent maneja el ordenamiento internamente
  }
}
