import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { Usuario } from '../../../../../core/models/users/usuario';
import { Paciente } from '../../../../../core/models/users/paciente';

@Component({
  selector: 'app-gestion-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './gestion-pacientes.component.html',
  styleUrls: ['./gestion-pacientes.component.css']
})
export class GestionPacientesComponent implements OnInit {
  pacientes: Paciente[] = [];
  isLoading = false;

  // 📋 Configuración de columnas para mostrar pacientes reales
  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'nombre', label: 'Nombre Completo', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'telefono', label: 'Teléfono', sortable: false },
    { key: 'tipoDocumento', label: 'Tipo Doc.', sortable: false },
    { key: 'numeroDocumento', label: 'Número Doc.', sortable: true },
    { key: 'fechaNacimiento', label: 'Fecha Nac.', sortable: true },
    { key: 'genero', label: 'Género', sortable: true }
  ];

  // 🎯 Configuración de acciones
  actions: TableAction[] = [
    { icon: 'fas fa-eye', label: 'Ver', action: 'view', class: 'btn-view' },
    { icon: 'fas fa-edit', label: 'Editar', action: 'edit', class: 'btn-edit' },
    { icon: 'fas fa-trash', label: 'Eliminar', action: 'delete', class: 'btn-delete' }
  ];

  ngOnInit(): void {
    this.cargarPacientes();
  }

  // 👥 Cargar pacientes reales desde localStorage
  cargarPacientes(): void {
    this.isLoading = true;
    
    // Simular delay de carga
    setTimeout(() => {
      const usuarios = this.obtenerUsuarios();
      this.pacientes = usuarios.filter(u => u.rol === 'paciente') as Paciente[];
      
      // Si no hay pacientes, agregar algunos de ejemplo
      if (this.pacientes.length === 0) {
        this.agregarPacientesEjemplo();
      }
      
      this.isLoading = false;
    }, 500);
  }

  // 📂 Obtener usuarios desde localStorage
  private obtenerUsuarios(): Usuario[] {
    const usuariosStr = localStorage.getItem('usuarios');
    return usuariosStr ? JSON.parse(usuariosStr) : [];
  }

  // 👤 Agregar pacientes de ejemplo si no existen
  private agregarPacientesEjemplo(): void {
    const usuarios = this.obtenerUsuarios();
    const nextId = Math.max(...usuarios.map(u => u.id), 0) + 1;
    
    const pacientesEjemplo: Paciente[] = [
      {
        id: nextId,
        nombre: 'Ana María Rodríguez',
        email: 'ana.rodriguez@email.com',
        telefono: '987654321',
        password: 'ana123',
        rol: 'paciente',
        tipoDocumento: 'DNI',
        numeroDocumento: '11223344',
        apellidoPaterno: 'Rodríguez',
        apellidoMaterno: 'García',
        fechaNacimiento: new Date('1990-05-15'),
        genero: 'femenino',
        pais: 'Perú',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'Miraflores',
        domicilio: 'Av. Larco 123'
      },
      {
        id: nextId + 1,
        nombre: 'Carlos Eduardo Mendoza',
        email: 'carlos.mendoza@email.com',
        telefono: '956789123',
        password: 'carlos123',
        rol: 'paciente',
        tipoDocumento: 'DNI',
        numeroDocumento: '55667788',
        apellidoPaterno: 'Mendoza',
        apellidoMaterno: 'Silva',
        fechaNacimiento: new Date('1985-08-22'),
        genero: 'masculino',
        pais: 'Perú',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'San Isidro',
        domicilio: 'Calle Real 456'
      },
      {
        id: nextId + 2,
        nombre: 'Sofía Elena Torres',
        email: 'sofia.torres@email.com',
        telefono: '912345678',
        password: 'sofia123',
        rol: 'paciente',
        tipoDocumento: 'DNI',
        numeroDocumento: '99887766',
        apellidoPaterno: 'Torres',
        apellidoMaterno: 'Vega',
        fechaNacimiento: new Date('1992-12-10'),
        genero: 'femenino',
        pais: 'Perú',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'Surco',
        domicilio: 'Jr. Las Flores 789'
      },
      {
        id: nextId + 3,
        nombre: 'Miguel Ángel Herrera',
        email: 'miguel.herrera@email.com',
        telefono: '923456789',
        password: 'miguel123',
        rol: 'paciente',
        tipoDocumento: 'DNI',
        numeroDocumento: '44556677',
        apellidoPaterno: 'Herrera',
        apellidoMaterno: 'Ruiz',
        fechaNacimiento: new Date('1968-03-20'),
        genero: 'masculino',
        pais: 'Perú',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'La Molina',
        domicilio: 'Av. Universidad 321'
      }
    ];
    
    usuarios.push(...pacientesEjemplo);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    this.pacientes = pacientesEjemplo;
  }

  // ➕ Agregar nuevo paciente
  agregarPaciente(): void {
    console.log('➕ Agregar nuevo paciente');
    // TODO: Implementar modal o navegación a formulario
    alert('Función de agregar paciente próximamente disponible');
  }

  // 🎯 Manejar acciones de tabla
  onTableAction(event: {action: string, item: any}): void {
    const paciente = event.item as Paciente;
    
    switch(event.action) {
      case 'view':
        this.verPaciente(paciente);
        break;
      case 'edit':
        this.editarPaciente(paciente);
        break;
      case 'delete':
        this.eliminarPaciente(paciente);
        break;
      default:
        console.log('Acción no reconocida:', event.action);
    }
  }

  // 📊 Manejar ordenamiento
  onSortChange(event: {column: string, direction: 'asc' | 'desc'}): void {
    console.log('🔄 Ordenar por:', event.column, event.direction);
    // El DataTableComponent maneja el ordenamiento internamente
  }

  // 👁️ Ver paciente
  private verPaciente(paciente: Paciente): void {
    console.log('👁️ Ver paciente:', paciente);
    const detalles = `
Paciente: ${paciente.nombre}
Email: ${paciente.email}
Teléfono: ${paciente.telefono}
Documento: ${paciente.tipoDocumento} - ${paciente.numeroDocumento}
Género: ${paciente.genero}
Fecha Nacimiento: ${paciente.fechaNacimiento?.toLocaleDateString() || 'No especificada'}
Dirección: ${paciente.domicilio || 'No especificada'}
    `;
    alert(detalles);
  }

  // ✏️ Editar paciente
  private editarPaciente(paciente: Paciente): void {
    console.log('✏️ Editar paciente:', paciente);
    // TODO: Implementar modal de edición
    alert('Función de editar paciente próximamente disponible');
  }

  // 🗑️ Eliminar paciente
  private eliminarPaciente(paciente: Paciente): void {
    const confirmacion = confirm(`¿Estás seguro de eliminar al paciente ${paciente.nombre}?`);
    
    if (confirmacion) {
      const usuarios = this.obtenerUsuarios();
      const usuariosActualizados = usuarios.filter(u => u.id !== paciente.id);
      
      localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados));
      this.cargarPacientes();
      
      console.log('🗑️ Paciente eliminado:', paciente.nombre);
    }
  }
}
