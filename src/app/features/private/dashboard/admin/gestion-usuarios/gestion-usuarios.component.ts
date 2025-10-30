import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { Usuario } from '../../../../../core/models/users/usuario';
import { Persona } from '../../../../../core/models/users/persona';
import { Rol } from '../../../../../core/models/users/rol';
import { UsuarioService } from '../../../../../core/services/rol/usuario.service';

@Component({
    selector: 'app-gestion-usuarios',
    standalone: true,
    imports: [CommonModule, FormsModule, DataTableComponent],
    templateUrl: './gestion-usuarios.component.html',
    styleUrl: './gestion-usuarios.component.css'
})
export class GestionUsuariosComponent implements OnInit {
    usuarios: UsuarioVM[] = [];
    isLoading = false;
    constructor(private usuarioService: UsuarioService) { }
    mostrarFormulario = false;
    modoEdicion = false;
    usuarioActual: UsuarioVM | null = null;
    mostrarModalVer = false;

    columns: TableColumn[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'nombre', label: 'Nombre Completo', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'rol', label: 'Rol', sortable: true },
        { key: 'telefono', label: 'Teléfono', sortable: false },
        { key: 'tipoDocumento', label: 'Tipo Doc.', sortable: false },
        { key: 'numeroDocumento', label: 'Número Doc.', sortable: true }
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
        },
        {
            action: 'resetPassword',
            label: 'Reset Pass',
            icon: 'fa fa-key',
            class: 'btn-warning'
        }
    ];

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    cargarUsuarios(): void {
        this.isLoading = true;
        this.usuarioService.getAll().subscribe({
            next: (lista: Usuario[]) => {
                this.usuarios = (lista || []).map(u => this.mapUsuarioToVM(u));
                this.isLoading = false;
            },
            error: _ => {
                // Fallback a localStorage (ya en formato VM)
                const ls = this.obtenerUsuariosLS();
                this.usuarios = ls.length ? ls : this.agregarUsuariosEjemplo();
                this.isLoading = false;
            }
        });
    }

    private agregarUsuariosEjemplo(): UsuarioVM[] {
        const usuariosEjemplo: UsuarioVM[] = [
            {
                id: 1,
                nombre: 'Administrador',
                apellidoPaterno: '',
                apellidoMaterno: '',
                email: 'admin@gmail.com',
                telefono: '999999999',
                rol: 'admin',
                tipoDocumento: 'DNI',
                numeroDocumento: '12345678',
                password: ''
            },
            {
                id: 2,
                nombre: 'Luján',
                apellidoPaterno: 'Carrión',
                apellidoMaterno: '',
                email: 'doctor@gmail.com',
                telefono: '999999999',
                rol: 'doctor',
                tipoDocumento: 'DNI',
                numeroDocumento: '87654321',
                password: ''
            },
            {
                id: 3,
                nombre: 'Ana María',
                apellidoPaterno: 'Rodríguez',
                apellidoMaterno: 'García',
                email: 'ana.rodriguez@email.com',
                telefono: '987654321',
                rol: 'paciente',
                tipoDocumento: 'DNI',
                numeroDocumento: '11223344',
                password: ''
            }
        ];
        localStorage.setItem('usuarios', JSON.stringify(usuariosEjemplo));
        return usuariosEjemplo;
    }

    obtenerUsuariosLS(): UsuarioVM[] {
        const usuariosStr = localStorage.getItem('usuarios');
        return usuariosStr ? JSON.parse(usuariosStr) : [];
    }

    agregarUsuario(): void {
        this.modoEdicion = false;
        this.usuarioActual = {
            id: 0,
            nombre: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            email: '',
            telefono: '',
            password: '',
            rol: 'paciente',
            tipoDocumento: 'DNI',
            numeroDocumento: ''
        };
        this.mostrarFormulario = true;
    }

    editarUsuario(usuario: UsuarioVM): void {
        this.modoEdicion = true;
        this.usuarioActual = { ...usuario };
        this.mostrarFormulario = true;
    }

    guardarUsuario(): void {
        if (!this.usuarioActual) return;
        // Validación de email obligatorio
        if (!this.usuarioActual.email || String(this.usuarioActual.email).trim().length === 0) {
            alert('El email es obligatorio.');
            return;
        }

        const payload = this.mapVMToUsuario(this.usuarioActual);
        if (this.modoEdicion && this.usuarioActual.id) {
            this.usuarioService.update(this.usuarioActual.id, payload).subscribe({
                next: _ => this.postSaveCleanup(),
                error: _ => this.saveLocalFallback()
            });
        } else {
            this.usuarioService.add(payload).subscribe({
                next: _ => this.postSaveCleanup(),
                error: _ => this.saveLocalFallback(true)
            });
        }
    }

    cancelarFormulario(): void {
        this.mostrarFormulario = false;
        this.usuarioActual = null;
        this.mostrarModalVer = false;
    }

    onTableAction(event: { action: string, item: any }): void {
        const usuario = event.item as UsuarioVM;

        switch (event.action) {
            case 'view':
                this.verUsuario(usuario);
                break;
            case 'edit':
                this.editarUsuario(usuario);
                break;
            case 'delete':
                this.eliminarUsuario(usuario);
                break;
            case 'resetPassword':
                this.resetearPassword(usuario);
                break;
            default:
                console.log('Acción no reconocida:', event.action);
        }
    }

    private verUsuario(usuario: UsuarioVM): void {
        this.usuarioActual = { ...usuario };
        this.mostrarModalVer = true;
    }

    private eliminarUsuario(usuario: UsuarioVM): void {
        if (usuario.rol === 'admin' && usuario.email === 'admin@gmail.com') {
            alert('No se puede eliminar el usuario administrador principal');
            return;
        }

        const confirmacion = confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre}?`);

        if (confirmacion) {
            // Intentar backend primero
            this.usuarioService.delete(usuario.id).subscribe({
                next: _ => this.cargarUsuarios(),
                error: _ => {
                    const usuarios = this.obtenerUsuariosLS();
                    const usuariosActualizados = usuarios.filter(u => u.id !== usuario.id);
                    localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados));
                    this.cargarUsuarios();
                    console.log('🗑️ Usuario eliminado (local):', usuario.nombre);
                }
            });
        }
    }

    private resetearPassword(usuario: UsuarioVM): void {
        const confirmacion = confirm(`¿Resetear la contraseña de ${usuario.nombre}?`);

        if (confirmacion) {
            const nuevaPassword = 'temp123';
            const payload = this.mapVMToUsuario({ ...usuario, password: nuevaPassword });
            this.usuarioService.update(usuario.id, payload).subscribe({
                next: _ => {
                    alert(`Contraseña reseteada para ${usuario.nombre}\nNueva contraseña temporal: ${nuevaPassword}`);
                    this.cargarUsuarios();
                },
                error: _ => {
                    // Fallback local
                    const usuarios = this.obtenerUsuariosLS();
                    const idx = usuarios.findIndex(u => u.id === usuario.id);
                    if (idx !== -1) {
                        usuarios[idx].password = nuevaPassword;
                        localStorage.setItem('usuarios', JSON.stringify(usuarios));
                        alert(`Contraseña reseteada para ${usuario.nombre}\nNueva contraseña temporal: ${nuevaPassword}`);
                        this.cargarUsuarios();
                    }
                }
            });
        }
    }

    onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
        console.log('🔄 Ordenar por:', event.column, event.direction);
    }

    getRolClass(rol: string): string {
        switch (rol) {
            case 'admin':
            case 'Administrador':
                return 'rol-admin';
            case 'doctor':
            case 'Medico':
                return 'rol-doctor';
            case 'paciente':
            case 'Paciente':
                return 'rol-paciente';
            default:
                return 'rol-default';
        }
    }
}

// Vista de Usuario para tabla/formulario
interface UsuarioVM {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
    telefono: string;
    rol: 'admin' | 'doctor' | 'paciente' | string;
    tipoDocumento: string;
    numeroDocumento: string;
    password?: string;
    especialidad?: string; // solo UI, no se envía al backend aquí
}

// Utilidades de mapeo
function rolNombreToVM(rol?: Rol): UsuarioVM['rol'] {
    if (!rol) return 'paciente';
    switch (rol.nombre) {
        case 'Administrador': return 'admin';
        case 'Medico': return 'doctor';
        case 'Paciente': return 'paciente';
        default: return rol.nombre;
    }
}

function rolVMToModel(rol: UsuarioVM['rol']): Rol {
    switch (rol) {
        case 'admin': return { idRol: 1, nombre: 'Administrador' } as Rol;
        case 'doctor': return { idRol: 2, nombre: 'Medico' } as Rol;
        case 'paciente':
        default: return { idRol: 3, nombre: 'Paciente' } as Rol;
    }
}

// Métodos de instancia para mapear (dentro de la clase)
export interface GestionUsuariosComponent {
    mapUsuarioToVM(u: Usuario): UsuarioVM;
    mapVMToUsuario(vm: UsuarioVM): Usuario;
    postSaveCleanup(): void;
    saveLocalFallback(isCreate?: boolean): void;
}

GestionUsuariosComponent.prototype.mapUsuarioToVM = function (u: Usuario): UsuarioVM {
    const p: Persona | undefined = u.persona as any;
    return {
        id: u.idUsuario ?? 0,
        nombre: p?.nombre1 || '',
        apellidoPaterno: p?.apellidoPaterno || '',
        apellidoMaterno: p?.apellidoMaterno || '',
        email: u.correo || '',
        telefono: p?.telefono || '',
        rol: rolNombreToVM(u.rol),
        tipoDocumento: p?.tipoDocumento || 'DNI',
        numeroDocumento: p?.dni || '',
        password: ''
    };
};

GestionUsuariosComponent.prototype.mapVMToUsuario = function (vm: UsuarioVM): Usuario {
    const persona: Persona = {
        tipoDocumento: vm.tipoDocumento || 'DNI',
        dni: vm.numeroDocumento || '',
        nombre1: vm.nombre || '',
        nombre2: '',
        apellidoPaterno: vm.apellidoPaterno || '',
        apellidoMaterno: vm.apellidoMaterno || '',
        fechaNacimiento: new Date().toISOString(),
        genero: 'otro',
        pais: 'PE',
        departamento: '',
        provincia: '',
        distrito: '',
        direccion: '',
        telefono: vm.telefono || ''
    };
    const usuario: Usuario = {
        correo: vm.email,
        password: vm.password || undefined,
        rol: rolVMToModel(vm.rol),
        persona
    } as Usuario;
    // id para updates
    if (vm.id) (usuario as any).idUsuario = vm.id;
    return usuario;
};

GestionUsuariosComponent.prototype.postSaveCleanup = function () {
    this.usuarioActual = null;
    this.modoEdicion = false;
    this.cargarUsuarios();
};

GestionUsuariosComponent.prototype.saveLocalFallback = function (isCreate = false) {
    const usuarios = this.obtenerUsuariosLS();
    if (this.usuarioActual) {
        if (this.modoEdicion) {
            const idx = usuarios.findIndex((u: UsuarioVM) => u.id === this.usuarioActual!.id);
            if (idx > -1) {
                usuarios[idx] = { ...this.usuarioActual };
            }
        } else if (isCreate) {
            const currentIds = usuarios.map((u: UsuarioVM) => u.id || 0);
            const maxId = currentIds.length ? Math.max(...currentIds) : 0;
            const nuevo: UsuarioVM = { ...this.usuarioActual, id: maxId + 1 };
            usuarios.push(nuevo);
        }
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    this.postSaveCleanup();
};
