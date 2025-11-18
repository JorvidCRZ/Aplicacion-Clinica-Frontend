import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableAction, TableColumn } from '../../../../../shared/components/data-table/data-table.component';
import { AdminService } from '../../../../../core/services/rol/admin.service';
import { Admin } from '../../../../../core/models/users/admin';

@Component({
  selector: 'app-gestion-admins',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './gestion-admins.component.html',
  styleUrls: ['./gestion-admins.component.css']
})
export class GestionAdminsComponent implements OnInit {
  admins: AdminVM[] = [];
  isLoading = false;
  mostrarModalVer = false;
  adminActual: AdminVM | null = null;
  modoEdicion = false;
  tablePageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  columns: TableColumn[] = [
    { key: 'idAdmin', label: 'ID', sortable: true, width: '80px' },
    { key: 'nombreCompleto', label: 'Nombre', sortable: true },
    { key: 'cargo', label: 'Cargo', sortable: true },
    { key: 'nivelAcceso', label: 'Nivel de Acceso', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true, type: 'status' },
    { key: 'createdAt', label: 'Creado', sortable: true, type: 'date', width: '140px' }
  ];

  actions: TableAction[] = [
    { icon: 'fas fa-eye', label: 'Ver', action: 'view', class: 'btn-view' },
    { icon: 'fas fa-edit', label: 'Editar', action: 'edit', class: 'btn-edit' },
    { icon: 'fas fa-trash', label: 'Eliminar', action: 'delete', class: 'btn-delete' }
  ];

  nivelesAcceso = ['alto', 'medio', 'bajo'];
  estadosDisponibles = ['activo', 'inactivo'];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarAdmins();
  }

  cargarAdmins(): void {
    this.isLoading = true;
    this.adminService.listar().subscribe({
      next: (lista: Admin[]) => {
        const datos = (lista || []).map(a => this.mapAdminToVM(a));
        if (datos.length) {
          this.admins = datos;
        } else {
          const locales = this.obtenerAdminsLocal();
          this.admins = locales.length ? locales : this.agregarAdminsEjemplo();
        }
        this.isLoading = false;
      },
      error: _ => {
        const locales = this.obtenerAdminsLocal();
        this.admins = locales && locales.length ? locales : this.agregarAdminsEjemplo();
        this.isLoading = false;
      }
    });
  }

  onTableAction(event: { action: string; item: AdminVM }): void {
    const admin = event.item;
    switch (event.action) {
      case 'view':
        this.verAdmin(admin);
        break;
      case 'edit':
        this.editarAdmin(admin);
        break;
      case 'delete':
        this.eliminarAdmin(admin);
        break;
    }
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    console.log('Ordenar por', event.column, event.direction);
  }

  onPageChanged(event: { page: number; pageSize: number }): void {
    this.tablePageSize = event.pageSize;
  }

  agregarAdmin(): void {
    this.modoEdicion = false;
    this.mostrarModalVer = false;
    this.adminActual = {
      idAdmin: 0,
      nombreCompleto: '',
      cargo: '',
      nivelAcceso: 'medio',
      estado: 'activo',
      createdAt: new Date().toISOString(),
      correo: '',
      telefono: ''
    };
  }

  private verAdmin(admin: AdminVM): void {
    this.adminActual = { ...admin };
    this.mostrarModalVer = true;
    this.modoEdicion = false;
  }

  private editarAdmin(admin: AdminVM): void {
    this.adminActual = { ...admin };
    this.modoEdicion = true;
    this.mostrarModalVer = false;
  }

  guardarAdmin(): void {
    if (!this.adminActual) return;

    if (this.modoEdicion && this.adminActual.idAdmin) {
      this.adminActual.updatedAt = new Date().toISOString();
      this.saveLocalEdit();
      return;
    }

    const payload = this.mapVMToAdmin(this.adminActual);
    this.adminService.crear(payload).subscribe({
      next: _ => this.postSaveCleanup(),
      error: _ => this.saveLocalCreate()
    });
  }

  private eliminarAdmin(admin: AdminVM): void {
    if (!confirm(`¿Eliminar administrador ${admin.nombreCompleto}?`)) return;

    this.adminService.eliminar(admin.idAdmin).subscribe({
      next: _ => this.cargarAdmins(),
      error: _ => {
        const lista = this.obtenerAdminsLocal().filter(a => a.idAdmin !== admin.idAdmin);
        this.guardarAdminsLocal(lista);
        this.cargarAdmins();
      }
    });
  }

  cancelarFormulario(): void {
    this.adminActual = null;
    this.mostrarModalVer = false;
    this.modoEdicion = false;
  }

  private saveLocalCreate(): void {
    const lista = this.obtenerAdminsLocal();
    const nuevoId = lista.length ? Math.max(...lista.map(a => a.idAdmin)) + 1 : 1;
    if (this.adminActual) {
      this.adminActual.idAdmin = nuevoId;
      lista.push(this.adminActual);
      this.guardarAdminsLocal(lista);
    }
    this.postSaveCleanup();
  }

  private saveLocalEdit(): void {
    const lista = this.obtenerAdminsLocal();
    if (this.adminActual) {
      const idx = lista.findIndex(a => a.idAdmin === this.adminActual!.idAdmin);
      if (idx > -1) {
        lista[idx] = this.adminActual;
      }
      this.guardarAdminsLocal(lista);
    }
    this.postSaveCleanup();
  }

  private postSaveCleanup(): void {
    this.adminActual = null;
    this.mostrarModalVer = false;
    this.modoEdicion = false;
    this.cargarAdmins();
  }

  private obtenerAdminsLocal(): AdminVM[] {
    const data = localStorage.getItem('admins');
    return data ? JSON.parse(data) : [];
  }

  private guardarAdminsLocal(lista: AdminVM[]): void {
    localStorage.setItem('admins', JSON.stringify(lista));
  }

  private agregarAdminsEjemplo(): AdminVM[] {
    const ejemplo: AdminVM[] = [
      { idAdmin: 1, nombreCompleto: 'Juan Pérez', cargo: 'Super Admin', nivelAcceso: 'alto', estado: 'activo', createdAt: new Date().toISOString(), correo: 'juan.perez@clinica.com', telefono: '987654321' },
      { idAdmin: 2, nombreCompleto: 'María López', cargo: 'Gestión', nivelAcceso: 'medio', estado: 'activo', createdAt: new Date().toISOString(), correo: 'maria.lopez@clinica.com', telefono: '965478123' },
      { idAdmin: 3, nombreCompleto: 'Carlos Ruiz', cargo: 'Operaciones', nivelAcceso: 'bajo', estado: 'inactivo', createdAt: new Date().toISOString(), correo: 'carlos.ruiz@clinica.com', telefono: '954123789' }
    ];
    this.guardarAdminsLocal(ejemplo);
    return ejemplo;
  }

  private mapAdminToVM(admin: Admin): AdminVM {
    return {
      idAdmin: admin.idAdmin,
      nombreCompleto: admin.nombreCompleto,
      cargo: admin.cargo,
      nivelAcceso: admin.nivelAcceso,
      estado: admin.estado,
      createdAt: admin.createdAt || new Date().toISOString(),
      correo: admin.usuario?.correo || '',
      telefono: admin.persona?.telefono || ''
    };
  }

  private mapVMToAdmin(vm: AdminVM): Admin {
    return {
      idAdmin: vm.idAdmin,
      nombreCompleto: vm.nombreCompleto,
      personaId: 0,
      usuarioId: 0,
      usuarioAgregoId: 0,
      persona: {
        nombre1: vm.nombreCompleto,
        telefono: vm.telefono
      } as any,
      cargo: vm.cargo,
      nivelAcceso: vm.nivelAcceso,
      estado: vm.estado,
      createdAt: vm.createdAt,
      updatedAt: new Date().toISOString()
    } as Admin;
  }
}

interface AdminVM {
  idAdmin: number;
  nombreCompleto: string;
  cargo: string;
  nivelAcceso: string;
  estado: string;
  createdAt: string;
  updatedAt?: string;
  correo?: string;
  telefono?: string;
}
