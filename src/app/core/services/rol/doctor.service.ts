import { Injectable } from '@angular/core';
import { Doctor } from '../../models/users/doctor';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private storageKey = 'usuarios';

  getAll(): Doctor[] {
    const usuariosStr = localStorage.getItem(this.storageKey);
    const usuarios = usuariosStr ? JSON.parse(usuariosStr) : [];
    return usuarios.filter((u: any) => u.rol === 'doctor');
  }

  getById(id: number): Doctor | undefined {
    return this.getAll().find(d => d.id === id);
  }

  add(doctor: Doctor): void {
    const usuariosStr = localStorage.getItem(this.storageKey);
    const usuarios = usuariosStr ? JSON.parse(usuariosStr) : [];
    doctor.id = this.getNextId(usuarios);
    usuarios.push(doctor);
    localStorage.setItem(this.storageKey, JSON.stringify(usuarios));
  }

  update(doctor: Doctor): void {
    const usuariosStr = localStorage.getItem(this.storageKey);
    let usuarios = usuariosStr ? JSON.parse(usuariosStr) : [];
    usuarios = usuarios.map((u: any) => u.id === doctor.id ? doctor : u);
    localStorage.setItem(this.storageKey, JSON.stringify(usuarios));
  }

  delete(id: number): void {
    const usuariosStr = localStorage.getItem(this.storageKey);
    let usuarios = usuariosStr ? JSON.parse(usuariosStr) : [];
    usuarios = usuarios.filter((u: any) => u.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(usuarios));
  }

  private getNextId(usuarios: any[]): number {
    return usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
  }
}
