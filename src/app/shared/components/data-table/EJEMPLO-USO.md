/* 📊 EJEMPLO DE USO DEL DATA-TABLE COMPONENT */

/* ============================================
   EJEMPLO 1: GESTIÓN DE PACIENTES
   ============================================ */

// En el componente TypeScript:
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';

export class GestionPacientesComponent {
  // 📋 Datos de la tabla
  pacientes = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@email.com',
      telefono: '123456789',
      fechaNacimiento: '1985-05-15',
      estado: 'activo'
    },
    // ... más pacientes
  ];

  // 📋 Configuración de columnas
  columns: TableColumn[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'fechaNacimiento', label: 'Fecha Nacimiento', type: 'date' },
    { key: 'estado', label: 'Estado', type: 'status' }
  ];

  // 🎯 Configuración de acciones
  actions: TableAction[] = [
    { icon: 'fas fa-eye', label: 'Ver', action: 'view', class: 'btn-primary' },
    { icon: 'fas fa-edit', label: 'Editar', action: 'edit', class: 'btn-success' },
    { icon: 'fas fa-trash', label: 'Eliminar', action: 'delete', class: 'btn-danger' }
  ];

  // 🎯 Manejar acciones
  onTableAction(event: {action: string, item: any}) {
    switch(event.action) {
      case 'view':
        this.verPaciente(event.item);
        break;
      case 'edit':
        this.editarPaciente(event.item);
        break;
      case 'delete':
        this.eliminarPaciente(event.item);
        break;
    }
  }

  // 📊 Manejar ordenamiento
  onSortChange(event: {column: string, direction: 'asc' | 'desc'}) {
    // Implementar lógica de ordenamiento
    console.log('Ordenar por:', event.column, event.direction);
  }
}

/* ============================================
   HTML TEMPLATE EJEMPLO:
   ============================================ */

/*
<div class="page-container">
  <div class="page-header">
    <h2>Gestión de Pacientes</h2>
    <button class="btn btn-primary">
      <i class="fas fa-plus"></i>
      Agregar Paciente
    </button>
  </div>

  <app-data-table
    [data]="pacientes"
    [columns]="columns"
    [actions]="actions"
    [searchable]="true"
    [loading]="isLoading"
    emptyMessage="No hay pacientes registrados"
    (actionClicked)="onTableAction($event)"
    (sortChanged)="onSortChange($event)">
  </app-data-table>
</div>
*/

/* ============================================
   EJEMPLO 2: GESTIÓN DE DOCTORES
   ============================================ */

/*
columns: TableColumn[] = [
  { key: 'nombre', label: 'Doctor', sortable: true },
  { key: 'especialidad', label: 'Especialidad', sortable: true },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'email', label: 'Email' },
  { key: 'estado', label: 'Estado', type: 'status' }
];
*/

/* ============================================
   EJEMPLO 3: GESTIÓN DE CITAS
   ============================================ */

/*
columns: TableColumn[] = [
  { key: 'fecha', label: 'Fecha', type: 'date', sortable: true },
  { key: 'hora', label: 'Hora' },
  { key: 'paciente', label: 'Paciente', sortable: true },
  { key: 'doctor', label: 'Doctor', sortable: true },
  { key: 'estado', label: 'Estado', type: 'status' }
];
*/