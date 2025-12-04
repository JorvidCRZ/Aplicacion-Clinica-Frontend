import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { Paciente } from '../../../../../core/models/users/paciente';
import { PacienteService } from '../../../../../core/services/rol/paciente.service';
import { ReportesService } from '../../../../../core/services/logic/reportes.service';

@Component({
    selector: 'app-gestion-pacientes',
    standalone: true,
    imports: [CommonModule, FormsModule, DataTableComponent],
    templateUrl: './gestion-pacientes.component.html',
    styleUrls: ['./gestion-pacientes.component.css']
})
export class GestionPacientesComponent implements OnInit {
    pacientes: PacienteVM[] = [];
    pacientesLocales: PacienteVM[] = []; // Solo pacientes locales
    isLoading = false;
    mostrarModalVer = false;
    mostrarFormulario = false; // Para mostrar formulario de agregar/editar
    pacienteActual: PacienteVM | null = null;
    modoEdicion = false;
    
    constructor(
        private pacienteService: PacienteService, 
        private reportesService: ReportesService
    ) { }

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

    generos = [
        { value: 'masculino', label: 'Masculino' },
        { value: 'femenino', label: 'Femenino' },
        { value: 'otro', label: 'Otro' }
    ];

    tiposDocumento = [
        { value: 'DNI', label: 'DNI' },
        { value: 'CE', label: 'Carné Extranjería' },
        { value: 'PAS', label: 'Pasaporte' }
    ];

    ngOnInit(): void {
        this.cargarPacientesBackend();
        this.cargarPacientesLocales();
    }

    // Cargar pacientes desde backend
    cargarPacientesBackend(): void {
        this.isLoading = true;
        this.pacienteService.getAll().subscribe({
            next: (lista: Paciente[]) => {
                const pacientesBackend = (lista || []).map(p => this.mapPacienteToVM(p));
                this.pacientes = [...pacientesBackend];
                // Combinar con locales
                this.combinarPacientes();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error cargando pacientes del backend:', error);
                // Solo cargar locales si falla backend
                this.pacientes = [...this.pacientesLocales];
                this.isLoading = false;
            }
        });
    }

    // Cargar pacientes locales
    private cargarPacientesLocales(): void {
        const pacientesStr = localStorage.getItem('pacientes_locales');
        if (pacientesStr) {
            try {
                this.pacientesLocales = JSON.parse(pacientesStr);
                this.pacientesLocales.forEach(p => {
                    p.esLocal = true;
                    // Asegurar que los IDs sean positivos
                    if (p.id <= 0) {
                        p.id = 1; // Convertir negativos o cero a 1
                    }
                });
            } catch (e) {
                console.error('Error parsing pacientes_locales:', e);
                this.pacientesLocales = [];
            }
        }
    }

    // Guardar pacientes locales
    private guardarPacientesLocales(): void {
        localStorage.setItem('pacientes_locales', JSON.stringify(this.pacientesLocales));
    }

    // Combinar pacientes del backend con locales
    private combinarPacientes(): void {
        const idsBackend = this.pacientes.filter(p => !p.esLocal).map(p => p.id);
        this.pacientesLocales = this.pacientesLocales.filter(local => 
            !idsBackend.includes(local.id)
        );
        
        const todosPacientes = [
            ...this.pacientes.filter(p => !p.esLocal),
            ...this.pacientesLocales
        ];
        
        this.pacientes = todosPacientes;
    }

    // Botón de agregar paciente - FUNCIONA LOCALMENTE
    agregarPaciente(): void {
        this.modoEdicion = false;
        this.pacienteActual = {
            id: this.generarNuevoId(),
            nombre: '',
            email: '',
            telefono: '',
            tipoDocumento: 'DNI',
            numeroDocumento: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            fechaNacimiento: '',
            genero: 'otro',
            domicilio: '',
            esLocal: true // IMPORTANTE: Marcar como local
        };
        this.mostrarFormulario = true;
    }

    // ✅ CORREGIDO: Generar ID único ascendente
    private generarNuevoId(): number {
        // Encontrar todos los IDs existentes (backend + locales)
        const todosIds = this.obtenerTodosLosIds();
        
        if (todosIds.length === 0) return 1; // Primer ID si no hay pacientes
        
        const maxId = Math.max(...todosIds);
        return maxId + 1; // Siguiente ID ascendente
    }

    // Obtener todos los IDs de pacientes
    private obtenerTodosLosIds(): number[] {
        const idsBackend = this.pacientes.filter(p => !p.esLocal).map(p => p.id);
        const idsLocales = this.pacientesLocales.map(p => p.id);
        return [...idsBackend, ...idsLocales].filter(id => id > 0); // Solo IDs positivos
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
        this.mostrarFormulario = true;
    }

    // Guardar paciente (LOCAL para nuevos, según origen para ediciones)
    guardarPaciente(): void {
        if (!this.pacienteActual) return;
        
        // Validar campos obligatorios
        if (!this.pacienteActual.email || String(this.pacienteActual.email).trim().length === 0) {
            alert('El email es obligatorio.');
            return;
        }
        
        if (!this.pacienteActual.nombre || String(this.pacienteActual.nombre).trim().length === 0) {
            alert('El nombre es obligatorio.');
            return;
        }

        if (this.modoEdicion) {
            // EDITAR paciente
            if (this.pacienteActual.esLocal) {
                // Actualizar en lista local
                this.pacientesLocales = this.pacientesLocales.map(p =>
                    p.id === this.pacienteActual?.id 
                        ? { ...this.pacienteActual! }
                        : p
                );
                
                this.guardarPacientesLocales();
                alert("✅ Paciente local actualizado");
            } else {
                // Intentar actualizar en backend
                this.actualizarEnBackend();
                return;
            }
            
        } else {
            // ✅ CREAR nuevo paciente LOCAL (NO se envía al backend)
            const idNuevo = this.generarNuevoId();
            const nuevoPaciente: PacienteVM = { 
                ...this.pacienteActual,
                id: idNuevo,
                esLocal: true
            };
            
            // Agregar a lista local
            this.pacientesLocales.push(nuevoPaciente);
            this.guardarPacientesLocales();
            
            alert(`✅ Paciente agregado localmente (ID: ${idNuevo})`);
        }
        
        // Actualizar lista combinada
        this.combinarPacientes();
        
        // Limpiar formulario
        this.cancelarFormulario();
    }

    private actualizarEnBackend(): void {
        if (!this.pacienteActual) return;

        const payload = this.mapVMToPaciente(this.pacienteActual);
        
        this.pacienteService.update(this.pacienteActual.id, payload).subscribe({
            next: () => {
                // Actualizar en lista local
                this.pacientes = this.pacientes.map(p =>
                    p.id === this.pacienteActual?.id 
                        ? { ...this.pacienteActual! }
                        : p
                );
                
                alert("✅ Paciente actualizado en el sistema");
                this.cancelarFormulario();
                
                // Recargar desde backend
                setTimeout(() => this.cargarPacientesBackend(), 500);
            },
            error: (error) => {
                console.error('Error actualizando en backend:', error);
                alert("⚠️ No se pudo actualizar en el sistema. Los cambios son locales.");
                
                // Actualizar localmente como fallback
                this.pacientes = this.pacientes.map(p =>
                    p.id === this.pacienteActual?.id 
                        ? { ...this.pacienteActual! }
                        : p
                );
                
                this.cancelarFormulario();
            }
        });
    }

    // Eliminar paciente
    private eliminarPaciente(paciente: PacienteVM): void {
        const confirmacion = confirm(`¿Estás seguro de eliminar al paciente ${paciente.nombre}?`);

        if (!confirmacion) return;

        if (paciente.esLocal) {
            // Eliminar local
            this.pacientesLocales = this.pacientesLocales.filter(p => p.id !== paciente.id);
            this.guardarPacientesLocales();
            this.combinarPacientes();
            alert("✅ Paciente local eliminado");
        } else {
            // Eliminar del backend
            this.pacienteService.delete(paciente.id).subscribe({
                next: () => {
                    this.pacientes = this.pacientes.filter(p => p.id !== paciente.id);
                    alert("✅ Paciente eliminado del sistema");
                },
                error: (error) => {
                    console.error('Error eliminando paciente:', error);
                    alert("❌ Error al eliminar el paciente");
                }
            });
        }
    }

    cancelarFormulario(): void {
        this.mostrarFormulario = false;
        this.mostrarModalVer = false;
        this.pacienteActual = null;
        this.modoEdicion = false;
    }

    // Mapeo desde modelo Paciente del backend
    private mapPacienteToVM(p: Paciente): PacienteVM {
        return {
            id: p.idPaciente || 0,
            idPersona: p.persona?.idPersona || 0,
            nombre: p.persona?.nombre1 || '',
            apellidoPaterno: p.persona?.apellidoPaterno || '',
            apellidoMaterno: p.persona?.apellidoMaterno || '',
            email: p.email || '',
            telefono: p.persona?.telefono || '',
            tipoDocumento: p.persona?.tipoDocumento || 'DNI',
            numeroDocumento: p.persona?.dni || '',
            genero: p.persona?.genero || '',
            fechaNacimiento: (p.persona?.fechaNacimiento as any) || '',
            domicilio: p.persona?.direccion || '',
            esLocal: false // Viene del backend
        };
    }

    // Mapeo para enviar al backend
    private mapVMToPaciente(vm: PacienteVM): any {
        return {
            idPersona: vm.idPersona || null,
            tipoSangre: null,
            peso: null,
            altura: null,
            contactoEmergenciaNombre: null,
            contactoEmergenciaRelacion: null,
            contactoEmergenciaTelefono: null,
            email: vm.email,
            persona: {
                idPersona: vm.idPersona || null,
                tipoDocumento: vm.tipoDocumento || 'DNI',
                dni: vm.numeroDocumento || '',
                nombre1: vm.nombre || '',
                nombre2: '',
                apellidoPaterno: vm.apellidoPaterno || '',
                apellidoMaterno: vm.apellidoMaterno || '',
                fechaNacimiento: vm.fechaNacimiento || null,
                genero: vm.genero || null,
                pais: 'PE',
                departamento: null,
                provincia: null,
                distrito: null,
                direccion: vm.domicilio || null,
                telefono: vm.telefono || null
            },
            usuarioAgrego: {
                correo: vm.email || null,
                telefono: vm.telefono || null
            }
        };
    }

    // FUNCIÓN DE DESCARGAR PDF - SE MANTIENE IGUAL
    descargarReportePacientesPDF(): void {
        this.reportesService.descargarPacientes('pdf').subscribe({
            next: (blob: Blob) => {
                const filename = 'reporte-pacientes.pdf';
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
                console.error('Error descargando reporte de pacientes:', err);
                alert('No se pudo descargar el reporte de pacientes. Revisa la consola.');
            }
        });
    }

    // Cargar pacientes de ejemplo si no hay datos
    private cargarPacientesEjemplo(): PacienteVM[] {
        const pacientesEjemplo: PacienteVM[] = [
            {
                id: 1,
                nombre: 'Ana María',
                email: 'ana.rodriguez@email.com',
                telefono: '987654321',
                tipoDocumento: 'DNI',
                numeroDocumento: '11223344',
                apellidoPaterno: 'Rodríguez',
                apellidoMaterno: 'García',
                fechaNacimiento: '1990-05-15',
                genero: 'femenino',
                domicilio: 'Av. Larco 123',
                esLocal: true
            },
            {
                id: 2,
                nombre: 'Carlos Eduardo',
                email: 'carlos.mendoza@email.com',
                telefono: '956789123',
                tipoDocumento: 'DNI',
                numeroDocumento: '55667788',
                apellidoPaterno: 'Mendoza',
                apellidoMaterno: 'Silva',
                fechaNacimiento: '1985-08-22',
                genero: 'masculino',
                domicilio: 'Calle Real 456',
                esLocal: true
            }
        ];

        this.pacientesLocales = pacientesEjemplo;
        this.guardarPacientesLocales();
        this.combinarPacientes();
        
        return pacientesEjemplo;
    }
}

interface PacienteVM {
    id: number;
    idPersona?: number;
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
    esLocal?: boolean;
}