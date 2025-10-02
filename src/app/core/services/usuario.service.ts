import { Injectable } from '@angular/core';
import { Usuario } from '../models/users/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private storageKey = 'usuarios';

  getAll(): Usuario[] {
    const usuariosStr = localStorage.getItem(this.storageKey);
    return usuariosStr ? JSON.parse(usuariosStr) : [];
  }

  getById(id: number): Usuario | undefined {
    return this.getAll().find(u => u.id === id);
  }

  add(usuario: Usuario): void {
    const usuarios = this.getAll();
    usuario.id = this.getNextId(usuarios);
    usuarios.push(usuario);
    localStorage.setItem(this.storageKey, JSON.stringify(usuarios));
  }

  update(usuario: Usuario): void {
    let usuarios = this.getAll();
    usuarios = usuarios.map(u => u.id === usuario.id ? usuario : u);
    localStorage.setItem(this.storageKey, JSON.stringify(usuarios));
  }

  delete(id: number): void {
    let usuarios = this.getAll();
    usuarios = usuarios.filter(u => u.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(usuarios));
  }

  private getNextId(usuarios: Usuario[]): number {
    return usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
  }
}
