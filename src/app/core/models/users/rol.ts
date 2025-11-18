export interface Rol {
    idRol: number;
    nombre: 'Administrador' | 'Medico' | 'Paciente';
    descripcion?: string;
}