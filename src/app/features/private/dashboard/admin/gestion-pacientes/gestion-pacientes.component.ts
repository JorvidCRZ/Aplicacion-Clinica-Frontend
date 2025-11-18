import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { Usuario } from '../../../../../core/models/users/usuario';
import { Paciente } from '../../../../../core/models/users/paciente';
import { PacienteService } from '../../../../../core/services/rol/paciente.service';

@Component({
    selector: 'app-gestion-pacientes',
    standalone: true,
    imports: [CommonModule, FormsModule, DataTableComponent],
    templateUrl: './gestion-pacientes.component.html',
    styleUrls: ['./gestion-pacientes.component.css']
})
export class GestionPacientesComponent implements OnInit {
    pacientes: PacienteVM[] = [];
    isLoading = false;
    mostrarModalVer = false;
    pacienteActual: PacienteVM | null = null;
    modoEdicion = false;
    constructor(private pacienteService: PacienteService) { }

    columns: TableColumn[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'nombre', label: 'Nombre Completo', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'telefono', label: 'Teléfono', sortable: false },
        { key: 'tipoDocumento', label: 'Tipo Doc.', sortable: false },
        { key: 'numeroDocumento', label: 'Número Doc.', sortable: true },
        { key: 'fechaNacimiento', label: 'Fecha Nac.', sortable: true, type: 'date' },
        { key: 'genero', label: 'Género', sortable: true }
    ];

    actions: TableAction[] = [
        { icon: 'fas fa-eye', label: 'Ver', action: 'view', class: 'btn-view' },
        { icon: 'fas fa-edit', label: 'Editar', action: 'edit', class: 'btn-edit' },
        { icon: 'fas fa-trash', label: 'Eliminar', action: 'delete', class: 'btn-delete' }
    ];

    ngOnInit(): void {
        this.cargarPacientes();
    }

    cargarPacientes(): void {
        this.isLoading = true;
        this.pacienteService.getAll().subscribe({
            next: (lista: Paciente[]) => {
                this.pacientes = (lista || []).map(p => this.mapPacienteToVM(p));
                this.isLoading = false;
            },
            error: _ => {
                // Fallback a localStorage 'usuarios'
                const usuarios = this.obtenerUsuarios();
                const pacientesLS = usuarios.filter(u => this.esPaciente(u));
                this.pacientes = pacientesLS.map(u => this.mapUsuarioToVM(u));
                if (this.pacientes.length === 0) {
                    this.agregarPacientesEjemplo();
                }
                this.isLoading = false;
            }
        });
    }

    private obtenerUsuarios(): any[] {
        const usuariosStr = localStorage.getItem('usuarios');
        return usuariosStr ? JSON.parse(usuariosStr) : [];
    }

    private agregarPacientesEjemplo(): void {
        const usuarios = this.obtenerUsuarios();
        const currentIds = usuarios.map((u: any) => u.id ?? u.idUsuario ?? 0);
        const maxId = currentIds.length ? Math.max(...currentIds) : 0;
        const nextId = maxId + 1;

        const pacientesEjemplo: PacienteVM[] = [
            {
                id: nextId,
                nombre: 'Ana María',
                email: 'ana.rodriguez@email.com',
                telefono: '987654321',
                tipoDocumento: 'DNI',
                numeroDocumento: '11223344',
                apellidoPaterno: 'Rodríguez',
                apellidoMaterno: 'García',
                fechaNacimiento: '1990-05-15',
                genero: 'femenino',
                domicilio: 'Av. Larco 123'
            },
            {
                id: nextId + 1,
                nombre: 'Carlos Eduardo',
                email: 'carlos.mendoza@email.com',
                telefono: '956789123',
                tipoDocumento: 'DNI',
                numeroDocumento: '55667788',
                apellidoPaterno: 'Mendoza',
                apellidoMaterno: 'Silva',
                fechaNacimiento: '1985-08-22',
                genero: 'masculino',
                domicilio: 'Calle Real 456'
            },
            {
                id: nextId + 2,
                nombre: 'Sofía Elena',
                email: 'sofia.torres@email.com',
                telefono: '912345678',
                tipoDocumento: 'DNI',
                numeroDocumento: '99887766',
                apellidoPaterno: 'Torres',
                apellidoMaterno: 'Vega',
                fechaNacimiento: '1992-12-10',
                genero: 'femenino',
                domicilio: 'Jr. Las Flores 789'
            },
            {
                id: nextId + 3,
                nombre: 'Miguel Ángel',
                email: 'miguel.herrera@email.com',
                telefono: '923456789',
                tipoDocumento: 'DNI',
                numeroDocumento: '44556677',
                apellidoPaterno: 'Herrera',
                apellidoMaterno: 'Ruiz',
                fechaNacimiento: '1968-03-20',
                genero: 'masculino',
                domicilio: 'Av. Universidad 321'
            }
        ];

        const nuevos = pacientesEjemplo.map(p => ({
            id: p.id,
            rol: 'paciente',
            nombre: p.nombre,
            apellidoPaterno: p.apellidoPaterno,
            apellidoMaterno: p.apellidoMaterno,
            email: p.email,
            telefono: p.telefono,
            tipoDocumento: p.tipoDocumento,
            numeroDocumento: p.numeroDocumento,
            genero: p.genero,
            fechaNacimiento: p.fechaNacimiento,
            domicilio: p.domicilio
        }));
        const actualizados = [...usuarios, ...nuevos];
        localStorage.setItem('usuarios', JSON.stringify(actualizados));
        this.pacientes = pacientesEjemplo;
    }

    agregarPaciente(): void {
        this.modoEdicion = false;
        this.pacienteActual = {
            id: 0,
            nombre: '',
            email: '',
            telefono: '',
            tipoDocumento: 'DNI',
            numeroDocumento: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            fechaNacimiento: '',
            genero: 'otro',
            domicilio: ''
        };
    }

    onTableAction(event: { action: string, item: any }): void {
        const paciente = event.item as PacienteVM;
        switch (event.action) {
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

    onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
        console.log('🔄 Ordenar por:', event.column, event.direction);
    }

    private verPaciente(paciente: PacienteVM): void {
        this.pacienteActual = { ...paciente };
        this.mostrarModalVer = true;
    }

    private editarPaciente(paciente: PacienteVM): void {
        this.modoEdicion = true;
        this.pacienteActual = { ...paciente };
    }

    guardarPaciente(): void {
        if (!this.pacienteActual) return;
        if (!this.pacienteActual.email || String(this.pacienteActual.email).trim().length === 0) {
            alert('El email es obligatorio.');
            return;
        }
        const payload = this.mapVMToPaciente(this.pacienteActual);
        if (this.modoEdicion && this.pacienteActual.id) {
            this.pacienteService.update(this.pacienteActual.id, payload).subscribe({
                next: _ => this.postSaveCleanup(),
                error: _ => this.saveLocalFallback()
            });
        } else {
            this.pacienteService.add(payload).subscribe({
                next: _ => this.postSaveCleanup(),
                error: _ => this.saveLocalFallback(true)
            });
        }
    }

    private eliminarPaciente(paciente: PacienteVM): void {
        const confirmacion = confirm(`¿Estás seguro de eliminar al paciente ${paciente.nombre}?`);

        if (confirmacion) {
            this.pacienteService.delete(paciente.id).subscribe({
                next: _ => this.cargarPacientes(),
                error: _ => {
                    const usuarios = this.obtenerUsuarios();
                    const filtrados = usuarios.filter((u: any) => (u.id ?? u.idUsuario) !== paciente.id);
                    localStorage.setItem('usuarios', JSON.stringify(filtrados));
                    this.cargarPacientes();
                }
            });
        }
    }

    cancelarFormulario(): void {
        this.mostrarModalVer = false;
        this.pacienteActual = null;
    }

    // Utilidades y mapeos
    private esPaciente(u: any): boolean {
        const rol = (typeof u.rol === 'string') ? u.rol : u.rol?.nombre;
        return String(rol || '').toLowerCase() === 'paciente';
    }

    private mapUsuarioToVM(u: any): PacienteVM {
        return {
            id: (u.id ?? u.idUsuario ?? 0),
            nombre: (u.nombre ?? u.persona?.nombre1 ?? ''),
            apellidoPaterno: (u.apellidoPaterno ?? u.persona?.apellidoPaterno ?? ''),
            apellidoMaterno: (u.apellidoMaterno ?? u.persona?.apellidoMaterno ?? ''),
            email: (u.email ?? u.correo ?? u.persona?.usuario?.correo ?? ''),
            telefono: (u.telefono ?? u.persona?.telefono ?? ''),
            tipoDocumento: (u.tipoDocumento ?? u.persona?.tipoDocumento ?? ''),
            numeroDocumento: (u.numeroDocumento ?? u.persona?.dni ?? ''),
            genero: (u.genero ?? u.persona?.genero ?? ''),
            fechaNacimiento: (u.fechaNacimiento ?? u.persona?.fechaNacimiento ?? ''),
            domicilio: (u.domicilio ?? u.persona?.direccion ?? '')
        };
    }

    private mapPacienteToVM(p: Paciente): PacienteVM {
        return {
            id: p.idPaciente || 0,
            nombre: p.persona?.nombre1 || '',
            apellidoPaterno: p.persona?.apellidoPaterno || '',
            apellidoMaterno: p.persona?.apellidoMaterno || '',
            email: p.email || '',
            telefono: p.persona?.telefono || '',
            tipoDocumento: p.persona?.tipoDocumento || 'DNI',
            numeroDocumento: p.persona?.dni || '',
            genero: p.persona?.genero || '',
            fechaNacimiento: (p.persona?.fechaNacimiento as any) || '',
            domicilio: p.persona?.direccion || ''
        };
    }

    private mapVMToPaciente(vm: PacienteVM): Paciente {
        const persona: any = {
            idPersona: undefined,
            tipoDocumento: vm.tipoDocumento || 'DNI',
            dni: vm.numeroDocumento || '',
            nombre1: vm.nombre || '',
            nombre2: '',
            apellidoPaterno: vm.apellidoPaterno || '',
            apellidoMaterno: vm.apellidoMaterno || '',
            fechaNacimiento: vm.fechaNacimiento || new Date().toISOString(),
            genero: vm.genero || 'otro',
            pais: 'PE',
            departamento: '',
            provincia: '',
            distrito: '',
            direccion: vm.domicilio || '',
            telefono: vm.telefono || ''
        };
        // Adjuntar usuario con correo obligatorio
        persona.usuario = {
            correo: vm.email,

            rol: { idRol: 3, nombre: 'Paciente' } as any
        } as Usuario;

        return { persona } as Paciente;
    }

    private postSaveCleanup() {
        this.pacienteActual = null;
        this.modoEdicion = false;
        this.cargarPacientes();
    }

    private saveLocalFallback(isCreate = false) {
        const usuarios = this.obtenerUsuarios();
        if (this.pacienteActual) {
            if (this.modoEdicion) {
                const idx = usuarios.findIndex((u: any) => (u.id ?? u.idUsuario) === this.pacienteActual!.id);
                if (idx > -1) {
                    usuarios[idx] = {
                        ...usuarios[idx],
                        id: this.pacienteActual.id,
                        rol: usuarios[idx].rol ?? 'paciente',
                        nombre: this.pacienteActual.nombre,
                        apellidoPaterno: this.pacienteActual.apellidoPaterno,
                        apellidoMaterno: this.pacienteActual.apellidoMaterno,
                        email: this.pacienteActual.email,
                        telefono: this.pacienteActual.telefono,
                        tipoDocumento: this.pacienteActual.tipoDocumento,
                        numeroDocumento: this.pacienteActual.numeroDocumento,
                        genero: this.pacienteActual.genero,
                        fechaNacimiento: this.pacienteActual.fechaNacimiento,
                        domicilio: this.pacienteActual.domicilio
                    };
                }
            } else if (isCreate) {
                const currentIds = usuarios.map((u: any) => u.id ?? u.idUsuario ?? 0);
                const maxId = currentIds.length ? Math.max(...currentIds) : 0;
                const nuevo: any = {
                    id: maxId + 1,
                    rol: 'paciente',
                    nombre: this.pacienteActual.nombre,
                    apellidoPaterno: this.pacienteActual.apellidoPaterno,
                    apellidoMaterno: this.pacienteActual.apellidoMaterno,
                    email: this.pacienteActual.email,
                    telefono: this.pacienteActual.telefono,
                    tipoDocumento: this.pacienteActual.tipoDocumento,
                    numeroDocumento: this.pacienteActual.numeroDocumento,
                    genero: this.pacienteActual.genero,
                    fechaNacimiento: this.pacienteActual.fechaNacimiento,
                    domicilio: this.pacienteActual.domicilio
                };
                usuarios.push(nuevo);
            }
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }
        this.postSaveCleanup();
    }
}

interface PacienteVM {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
    telefono: string;
    tipoDocumento: string;
    numeroDocumento: string;
    genero: string;
    fechaNacimiento: string | Date;
    domicilio: string;
}
