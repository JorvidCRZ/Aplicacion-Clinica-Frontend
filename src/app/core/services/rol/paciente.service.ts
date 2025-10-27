import { Injectable } from '@angular/core';
import { Paciente } from '../../models/users/paciente';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private storageKey = 'usuarios';

  getAll(): Paciente[] {
    const usuariosStr = localStorage.getItem(this.storageKey);
    const usuarios = usuariosStr ? JSON.parse(usuariosStr) : [];
    return usuarios.filter((u: any) => u.rol === 'paciente');
  }

  getById(id: number): Paciente | undefined {
    return this.getAll().find(u => u.id === id);
  }

  add(paciente: Paciente): void {
    const usuarios = this.getAll();
    paciente.id = this.getNextId(usuarios);
    usuarios.push(paciente);
    this.saveAll(usuarios);
  }

  update(paciente: Paciente): void {
    let usuarios = this.getAll();
    usuarios = usuarios.map(u => u.id === paciente.id ? paciente : u);
    this.saveAll(usuarios);
  }

  delete(id: number): void {
    let usuarios = this.getAll();
    usuarios = usuarios.filter(u => u.id !== id);
    this.saveAll(usuarios);
  }

  private saveAll(pacientes: Paciente[]): void {
    // Mezclar con otros usuarios si existen
    const usuariosStr = localStorage.getItem(this.storageKey);
    let usuarios = usuariosStr ? JSON.parse(usuariosStr) : [];
    usuarios = usuarios.filter((u: any) => u.rol !== 'paciente');
    usuarios = [...usuarios, ...pacientes];
    localStorage.setItem(this.storageKey, JSON.stringify(usuarios));
  }

  private getNextId(pacientes: Paciente[]): number {
    return pacientes.length > 0 ? Math.max(...pacientes.map(u => u.id)) + 1 : 1;
  }
}
