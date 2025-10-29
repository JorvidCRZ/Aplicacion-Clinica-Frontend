// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { DataTableComponent, TableColumn, TableAction } from '../../../../../shared/components/data-table/data-table.component';
// import { Usuario } from '../../../../../core/models/users/usuario';
// import { Paciente } from '../../../../../core/models/users/paciente';
// import { PacienteService } from '../../../../../core/services/rol/paciente.service';

// @Component({
//   selector: 'app-gestion-pacientes',
//   standalone: true,
//   imports: [CommonModule, FormsModule, DataTableComponent],
//   templateUrl: './gestion-pacientes.component.html',
//   styleUrls: ['./gestion-pacientes.component.css']
// })
// export class GestionPacientesComponent implements OnInit {
//   pacientes: Paciente[] = [];
//   isLoading = false;
//   mostrarModalVer = false;
//   pacienteActual: Paciente | null = null;
//   modoEdicion = false;
//   pacienteService = new PacienteService();

//   columns: TableColumn[] = [
//     { key: 'id', label: 'ID', sortable: true },
//     { key: 'nombre', label: 'Nombre Completo', sortable: true },
//     { key: 'email', label: 'Email', sortable: true },
//     { key: 'telefono', label: 'Teléfono', sortable: false },
//     { key: 'tipoDocumento', label: 'Tipo Doc.', sortable: false },
//     { key: 'numeroDocumento', label: 'Número Doc.', sortable: true },
//     { key: 'fechaNacimiento', label: 'Fecha Nac.', sortable: true },
//     { key: 'genero', label: 'Género', sortable: true }
//   ];

//   actions: TableAction[] = [
//     { icon: 'fas fa-eye', label: 'Ver', action: 'view', class: 'btn-view' },
//     { icon: 'fas fa-edit', label: 'Editar', action: 'edit', class: 'btn-edit' },
//     { icon: 'fas fa-trash', label: 'Eliminar', action: 'delete', class: 'btn-delete' }
//   ];

//   ngOnInit(): void {
//     this.cargarPacientes();
//   }

//   cargarPacientes(): void {
//     this.isLoading = true;
    
//     setTimeout(() => {
//       this.pacientes = this.pacienteService.getAll();
      
//       if (this.pacientes.length === 0) {
//         this.agregarPacientesEjemplo();
//       }
      
//       this.isLoading = false;
//     }, 500);
//   }

//   private obtenerUsuarios(): Usuario[] {
//     const usuariosStr = localStorage.getItem('usuarios');
//     return usuariosStr ? JSON.parse(usuariosStr) : [];
//   }

//   private agregarPacientesEjemplo(): void {
//     const usuarios = this.obtenerUsuarios();
//     const nextId = Math.max(...usuarios.map(u => u.id), 0) + 1;
    
//     const pacientesEjemplo: Paciente[] = [
//       {
//         id: nextId,
//         nombre: 'Ana María Rodríguez',
//         email: 'ana.rodriguez@email.com',
//         telefono: '987654321',
//         password: 'ana123',
//         rol: 'paciente',
//         tipoDocumento: 'DNI',
//         numeroDocumento: '11223344',
//         apellidoPaterno: 'Rodríguez',
//         apellidoMaterno: 'García',
//         fechaNacimiento: new Date('1990-05-15'),
//         genero: 'femenino',
//         pais: 'Perú',
//         departamento: 'Lima',
//         provincia: 'Lima',
//         distrito: 'Miraflores',
//         domicilio: 'Av. Larco 123'
//       },
//       {
//         id: nextId + 1,
//         nombre: 'Carlos Eduardo Mendoza',
//         email: 'carlos.mendoza@email.com',
//         telefono: '956789123',
//         password: 'carlos123',
//         rol: 'paciente',
//         tipoDocumento: 'DNI',
//         numeroDocumento: '55667788',
//         apellidoPaterno: 'Mendoza',
//         apellidoMaterno: 'Silva',
//         fechaNacimiento: new Date('1985-08-22'),
//         genero: 'masculino',
//         pais: 'Perú',
//         departamento: 'Lima',
//         provincia: 'Lima',
//         distrito: 'San Isidro',
//         domicilio: 'Calle Real 456'
//       },
//       {
//         id: nextId + 2,
//         nombre: 'Sofía Elena Torres',
//         email: 'sofia.torres@email.com',
//         telefono: '912345678',
//         password: 'sofia123',
//         rol: 'paciente',
//         tipoDocumento: 'DNI',
//         numeroDocumento: '99887766',
//         apellidoPaterno: 'Torres',
//         apellidoMaterno: 'Vega',
//         fechaNacimiento: new Date('1992-12-10'),
//         genero: 'femenino',
//         pais: 'Perú',
//         departamento: 'Lima',
//         provincia: 'Lima',
//         distrito: 'Surco',
//         domicilio: 'Jr. Las Flores 789'
//       },
//       {
//         id: nextId + 3,
//         nombre: 'Miguel Ángel Herrera',
//         email: 'miguel.herrera@email.com',
//         telefono: '923456789',
//         password: 'miguel123',
//         rol: 'paciente',
//         tipoDocumento: 'DNI',
//         numeroDocumento: '44556677',
//         apellidoPaterno: 'Herrera',
//         apellidoMaterno: 'Ruiz',
//         fechaNacimiento: new Date('1968-03-20'),
//         genero: 'masculino',
//         pais: 'Perú',
//         departamento: 'Lima',
//         provincia: 'Lima',
//         distrito: 'La Molina',
//         domicilio: 'Av. Universidad 321'
//       }
//     ];
    
//     usuarios.push(...pacientesEjemplo);
//     localStorage.setItem('usuarios', JSON.stringify(usuarios));
//     this.pacientes = pacientesEjemplo;
//   }

//   agregarPaciente(): void {
//     this.modoEdicion = false;
//     this.pacienteActual = {
//       id: 0,
//       nombre: '',
//       email: '',
//       telefono: '',
//       password: '',
//       rol: 'paciente',
//       tipoDocumento: '',
//       numeroDocumento: '',
//       apellidoPaterno: '',
//       apellidoMaterno: '',
//       fechaNacimiento: new Date(),
//       genero: 'otro',
//       pais: '',
//       departamento: '',
//       provincia: '',
//       distrito: '',
//       domicilio: ''
//     };
//   }

//   onTableAction(event: {action: string, item: any}): void {
//     const paciente = event.item as Paciente;
//     switch(event.action) {
//       case 'view':
//         this.verPaciente(paciente);
//         break;
//       case 'edit':
//         this.editarPaciente(paciente);
//         break;
//       case 'delete':
//         this.eliminarPaciente(paciente);
//         break;
//       default:
//         console.log('Acción no reconocida:', event.action);
//     }
//   }

//   onSortChange(event: {column: string, direction: 'asc' | 'desc'}): void {
//     console.log('🔄 Ordenar por:', event.column, event.direction);
//   }

//   private verPaciente(paciente: Paciente): void {
//     this.pacienteActual = { ...paciente };
//     this.mostrarModalVer = true;
//   }

//   private editarPaciente(paciente: Paciente): void {
//     this.modoEdicion = true;
//     this.pacienteActual = { ...paciente };
//   }

//   guardarPaciente(): void {
//     if (!this.pacienteActual) return;
//     if (this.modoEdicion) {
//       this.pacienteService.update(this.pacienteActual);
//     } else {
//       this.pacienteService.add(this.pacienteActual);
//     }
//     this.pacienteActual = null;
//     this.modoEdicion = false;
//     this.cargarPacientes();
//   }

//   private eliminarPaciente(paciente: Paciente): void {
//     const confirmacion = confirm(`¿Estás seguro de eliminar al paciente ${paciente.nombre}?`);
    
//     if (confirmacion) {
//       this.pacienteService.delete(paciente.id);
//       this.cargarPacientes();
      
//       console.log('🗑️ Paciente eliminado:', paciente.nombre);
//     }
//   }

//   cancelarFormulario(): void {
//     this.mostrarModalVer = false;
//     this.pacienteActual = null;
//   }
// }
