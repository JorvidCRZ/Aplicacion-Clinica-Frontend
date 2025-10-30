import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Paciente } from '../../../../../core/models/users/paciente';
import { PacienteService } from '../../../../../core/services/rol/paciente.service';
import { UserService } from '../../../../../core/services/auth/user.service';

@Component({
    selector: 'app-perfil-paciente',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './mi-perfil.component.html',
    styleUrls: ['./mi-perfil.component.css'],
})
export class MiPerfilComponent implements OnInit {

    editandoPersonal = false;
    editandoContacto = false;
    editandoMedica = false;
    editandoEmergencia = false;

    mensajeGuardado: string | null = null;

    perfilPaciente: Paciente = {
        persona: {
            tipoDocumento: '',
            dni: '',
            nombre1: '',
            nombre2: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            fechaNacimiento: '',
            genero: '',
            pais: '',
            departamento: '',
            provincia: '',
            distrito: '',
            direccion: '',
            telefono: ''
        },
        usuario: {
            idUsuario: undefined,
            correo: '',
            rol: { idRol: 3, nombre: 'Paciente' },
            persona: {} as any
        },
        tipoSangre: '',
        peso: undefined,
        altura: undefined,
        contactoEmergenciaNombre: '',
        contactoEmergenciaRelacion: '',
        contactoEmergenciaTelefono: '',
    };

    private copiaBackup: any = {};

    constructor(
        private pacienteService: PacienteService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        const idUsuario = this.userService.getIdUsuario();
        console.log('ID usuario actual:', idUsuario);

        this.pacienteService.getByUsuario(idUsuario).subscribe({
            next: (data) => {
                const anyData: any = data;
                this.perfilPaciente = data;

                if (!this.perfilPaciente.usuario && anyData.usuarioAgrego) {
                    this.perfilPaciente.usuario = anyData.usuarioAgrego;
                }

                const currentId = this.userService.getIdUsuario();
                if (this.perfilPaciente.usuario && this.perfilPaciente.usuario.idUsuario !== currentId) {
                    this.perfilPaciente.usuario = {
                        idUsuario: currentId,
                        correo: this.userService.getCorreoUsuarioActual() || this.perfilPaciente.usuario.correo,
                        rol: this.userService.current?.rol || { idRol: 3, nombre: 'Paciente' },
                        persona: this.perfilPaciente.persona as any
                    };
                }

                console.log('Paciente cargado:', this.perfilPaciente);
            },
            error: (err) => {
                console.error('Error al cargar paciente por usuario:', err);
                this.pacienteService.getById(this.userService.getIdUsuario()).subscribe({
                    next: (d) => {
                        const anyD: any = d;
                        this.perfilPaciente = d;
                        if (!this.perfilPaciente.usuario && anyD.usuarioAgrego) {
                            this.perfilPaciente.usuario = anyD.usuarioAgrego;
                        }
                    },
                    error: (e) => console.error('Fallback también falló:', e)
                });
            }
        });
    }

    editarInformacionPersonal() {
        this.copiaBackup = structuredClone(this.perfilPaciente);
        this.editandoPersonal = true;
    }
    guardarInformacionPersonal() {
        this.guardarCambios('Información personal guardada correctamente', 'persona');
        this.editandoPersonal = false;
    }
    cancelarEdicionPersonal() {
        this.perfilPaciente = structuredClone(this.copiaBackup);
        this.editandoPersonal = false;
    }

    editarContacto() {
        this.copiaBackup = structuredClone(this.perfilPaciente);
        this.editandoContacto = true;
    }
    guardarContacto() {
        this.guardarCambios('Información de contacto actualizada', 'persona');
        this.editandoContacto = false;
    }
    cancelarEdicionContacto() {
        this.perfilPaciente = structuredClone(this.copiaBackup);
        this.editandoContacto = false;
    }

    editarInformacionMedica() {
        this.copiaBackup = structuredClone(this.perfilPaciente);
        this.editandoMedica = true;
    }
    guardarInformacionMedica() {
        this.guardarCambios('Información médica guardada', 'paciente');
        this.editandoMedica = false;
    }
    cancelarEdicionMedica() {
        this.perfilPaciente = structuredClone(this.copiaBackup);
        this.editandoMedica = false;
    }

    editarEmergencia() {
        this.copiaBackup = structuredClone(this.perfilPaciente);
        this.editandoEmergencia = true;
    }
    guardarEmergencia() {
        this.guardarCambios('Contacto de emergencia actualizado', 'paciente');
        this.editandoEmergencia = false;
    }
    cancelarEdicionEmergencia() {
        this.perfilPaciente = structuredClone(this.copiaBackup);
        this.editandoEmergencia = false;
    }

    get correoActual(): string {
        return this.userService.getCorreoUsuarioActual() || '';
    }

    onCorreoChange(value: string): void {
        if (!this.perfilPaciente.usuario) {
            this.perfilPaciente.usuario = {
                idUsuario: this.userService.getIdUsuario(),
                correo: value,
                rol: this.userService.current?.rol || { idRol: 3, nombre: 'Paciente' },
                persona: this.perfilPaciente.persona as any
            };
        } else {
            this.perfilPaciente.usuario.correo = value;
        }
    }

    private guardarCambios(mensaje: string, tipo: 'paciente' | 'persona' = 'paciente') {
        if (tipo === 'persona') {
            if (!this.perfilPaciente.idPaciente) {
                console.warn('No hay idPaciente definido, no se puede actualizar persona desde paciente.');
                return;
            }

            if (!this.perfilPaciente.usuario) {
                this.perfilPaciente.usuario = {
                    idUsuario: this.userService.getIdUsuario(),
                    correo: this.userService.getCorreoUsuarioActual() || '',
                    rol: this.userService.current?.rol || { idRol: 3, nombre: 'Paciente' },
                    persona: this.perfilPaciente.persona as any
                };
            } else if (!this.perfilPaciente.usuario.idUsuario) {
                this.perfilPaciente.usuario.idUsuario = this.userService.getIdUsuario();
            }

            this.pacienteService.update(this.perfilPaciente.idPaciente!, this.perfilPaciente)
                .subscribe({
                    next: (actualizado) => {
                        this.perfilPaciente = actualizado;
                        const anyResp: any = actualizado;
                        const usuarioResp = anyResp.usuario || anyResp.usuarioAgrego || null;

                        const currentId = this.userService.getIdUsuario();

                        if (usuarioResp && usuarioResp.idUsuario === currentId) {
                            this.userService.updateLocalUser({
                                idUsuario: usuarioResp.idUsuario,
                                correo: usuarioResp.correo,
                                persona: usuarioResp.persona
                            });
                        } else {
                            const perfilUsuario = this.perfilPaciente.usuario;
                            if (perfilUsuario && perfilUsuario.idUsuario === currentId && perfilUsuario.correo) {
                                this.userService.updateLocalUser({
                                    idUsuario: perfilUsuario.idUsuario,
                                    correo: perfilUsuario.correo,
                                    persona: perfilUsuario.persona
                                });
                            }
                        }

                        this.mostrarMensaje(mensaje);
                    },
                    error: (err) => {
                        console.error('Error al actualizar persona/contacto:', err);
                    }
                });

            return;
        }

        if (this.perfilPaciente.idPaciente) {
            this.pacienteService.update(this.perfilPaciente.idPaciente, this.perfilPaciente)
                .subscribe({
                    next: (actualizado) => {
                        this.perfilPaciente = actualizado;
                        this.mostrarMensaje(mensaje);
                    },
                    error: (err) => console.error('Error al actualizar paciente:', err),
                });
        } else {
            console.warn('No hay idPaciente definido, no se puede actualizar');
        }
    }


    calcularIMC(): string {
        const peso = this.perfilPaciente.peso;
        const alturaM = this.perfilPaciente.altura ? this.perfilPaciente.altura / 100 : 0;
        if (!peso || !alturaM) return '';
        const imc = peso / (alturaM * alturaM);
        return imc.toFixed(2);
    }

    private mostrarMensaje(mensaje: string) {
        this.mensajeGuardado = mensaje;
        setTimeout(() => (this.mensajeGuardado = null), 3000);
    }
}