import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../../../core/models/users/usuario';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  searchTerm: string = '';
  mostrarModal: boolean = false;
  usuarioEditando: Usuario | null = null;
  
  usuarioForm = {
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    rol: 'paciente' as 'paciente' | 'admin' | 'doctor'
  };

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    // Cargar usuarios del localStorage
    const usuariosStr = localStorage.getItem('usuarios');
    if (usuariosStr) {
      this.usuarios = JSON.parse(usuariosStr);
    } else {
      // Usuarios de ejemplo-se podra borrar
      this.usuarios = [
        {
          id: 1,
          nombre: 'María García',
          email: 'maria@email.com',
          telefono: '999999999',
          password: '123456',
          rol: 'paciente'
        },
        {
          id: 2,
          nombre: 'Carlos López',
          email: 'carlos@email.com',
          telefono: '888888888',
          password: '123456',
          rol: 'paciente'
        },
        {
          id: 3,
          nombre: 'Ana Martín',
          email: 'ana@email.com',
          telefono: '777777777',
          password: '123456',
          rol: 'paciente'
        },
        {
          id: 4,
          nombre: 'Luis Rodríguez',
          email: 'luis@email.com',
          telefono: '666666666',
          password: '123456',
          rol: 'admin'
        }
      ];
    }
    this.usuariosFiltrados = [...this.usuarios];
  }

  filtrarUsuarios(): void {
    if (!this.searchTerm) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }
    
    this.usuariosFiltrados = this.usuarios.filter(usuario =>
      usuario.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  abrirModalNuevo(): void {
    this.usuarioEditando = null;
    this.usuarioForm = {
      nombre: '',
      email: '',
      telefono: '',
      password: '',
      rol: 'paciente' as 'paciente' | 'admin' | 'doctor'
    };
    this.mostrarModal = true;
  }

  editarUsuario(paciente: Usuario): void {
    this.usuarioEditando = paciente;
    this.usuarioForm = {
      nombre: paciente.nombre,
      email: paciente.email,
      telefono: paciente.telefono,
      password: paciente.password,
      rol: paciente.rol || 'paciente'
    };
    this.mostrarModal = true;
  }

  eliminarUsuario(paciente: Usuario): void {
    if (confirm(`¿Estás seguro de eliminar al paciente ${paciente.nombre}?`)) {
      this.usuarios = this.usuarios.filter(u => u.id !== paciente.id);
      this.filtrarUsuarios();
      this.guardarEnLocalStorage();
    }
  }

  guardarUsuario(): void {
    if (this.usuarioEditando) {
      // Actualizar usuario existente
      const index = this.usuarios.findIndex(u => u.id === this.usuarioEditando!.id);
      if (index !== -1) {
        this.usuarios[index] = {
          id: this.usuarios[index].id,
          nombre: this.usuarioForm.nombre,
          email: this.usuarioForm.email,
          telefono: this.usuarioForm.telefono,
          password: this.usuarioForm.password,
          rol: this.usuarioForm.rol
        };
      }
    } else {
      // Crear nuevo usuario
      const nuevoUsuario: Usuario = {
        id: Date.now(),
        nombre: this.usuarioForm.nombre,
        email: this.usuarioForm.email,
        telefono: this.usuarioForm.telefono,
        password: this.usuarioForm.password,
        rol: this.usuarioForm.rol
      };
      this.usuarios.push(nuevoUsuario);
    }
    
    this.filtrarUsuarios();
    this.guardarEnLocalStorage();
    this.cerrarModal();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.usuarioEditando = null;
  }

  private formatearFecha(fecha: Date): string {
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  }

  private guardarEnLocalStorage(): void {
    localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
  }
}
