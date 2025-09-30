import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { Usuario } from '../../../../../core/models/users/usuario';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css'
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  isLoading = false;

  // 📋 Configuración de columnas para la tabla
  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'nombre', label: 'Nombre Completo', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'rol', label: 'Rol', sortable: true },
    { key: 'telefono', label: 'Teléfono', sortable: false },
    { key: 'tipoDocumento', label: 'Tipo Doc.', sortable: false },
    { key: 'numeroDocumento', label: 'Número Doc.', sortable: true }
  ];

  // 🎯 Configuración de acciones para cada fila
  actions: TableAction[] = [
    {
      action: 'view',
      label: 'Ver',
      icon: 'fa-eye',
      class: 'btn-view'
    },
    {
      action: 'edit',
      label: 'Editar',
      icon: 'fa-edit',
      class: 'btn-edit'
    },
    {
      action: 'delete',
      label: 'Eliminar',
      icon: 'fa-trash',
      class: 'btn-delete'
    },
    {
      action: 'resetPassword',
      label: 'Reset Pass',
      icon: 'fa-key',
      class: 'btn-warning'
    }
  ];

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // 👥 Cargar datos de usuarios desde localStorage
  cargarUsuarios(): void {
    this.isLoading = true;
    
    // Simular delay de carga
    setTimeout(() => {
      this.usuarios = this.obtenerUsuarios();
      
      // Agregar usuarios de ejemplo si no existen
      if (this.usuarios.length === 0) {
        this.agregarUsuariosEjemplo();
      }
      
      this.isLoading = false;
    }, 500);
  }

  // 👤 Agregar usuarios de ejemplo
  private agregarUsuariosEjemplo(): void {
    const usuariosEjemplo: Usuario[] = [
      {
        id: 1,
        nombre: 'Administrador',
        email: 'admin@gmail.com',
        telefono: '999999999',
        password: 'admin123',
        rol: 'admin',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678'
      },
      {
        id: 2,
        nombre: 'Dr. Luján Carrión',
        email: 'doctor@gmail.com',
        telefono: '999999999',
        password: 'doctor123',
        rol: 'doctor',
        tipoDocumento: 'DNI',
        numeroDocumento: '87654321'
      },
      {
        id: 3,
        nombre: 'Ana María Rodríguez',
        email: 'ana.rodriguez@email.com',
        telefono: '987654321',
        password: 'ana123',
        rol: 'paciente',
        tipoDocumento: 'DNI',
        numeroDocumento: '11223344',
        apellidoPaterno: 'Rodríguez',
        apellidoMaterno: 'García',
        fechaNacimiento: new Date('1990-05-15'),
        genero: 'femenino'
      },
      {
        id: 4,
        nombre: 'Carlos Eduardo Mendoza',
        email: 'carlos.mendoza@email.com',
        telefono: '956789123',
        password: 'carlos123',
        rol: 'paciente',
        tipoDocumento: 'DNI',
        numeroDocumento: '55667788',
        apellidoPaterno: 'Mendoza',
        apellidoMaterno: 'Silva',
        fechaNacimiento: new Date('1985-08-22'),
        genero: 'masculino'
      },
      {
        id: 5,
        nombre: 'Sofía Elena Torres',
        email: 'sofia.torres@email.com',
        telefono: '912345678',
        password: 'sofia123',
        rol: 'paciente',
        tipoDocumento: 'DNI',
        numeroDocumento: '99887766',
        apellidoPaterno: 'Torres',
        apellidoMaterno: 'Vega',
        fechaNacimiento: new Date('1992-12-10'),
        genero: 'femenino'
      },
      {
        id: 6,
        nombre: 'Miguel Ángel Herrera',
        email: 'miguel.herrera@email.com',
        telefono: '923456789',
        password: 'miguel123',
        rol: 'paciente',
        tipoDocumento: 'DNI',
        numeroDocumento: '44556677',
        apellidoPaterno: 'Herrera',
        apellidoMaterno: 'Ruiz',
        fechaNacimiento: new Date('1968-03-20'),
        genero: 'masculino'
      }
    ];
    
    localStorage.setItem('usuarios', JSON.stringify(usuariosEjemplo));
    this.usuarios = usuariosEjemplo;
  }

  // 📂 Obtener usuarios desde localStorage
  private obtenerUsuarios(): Usuario[] {
    const usuariosStr = localStorage.getItem('usuarios');
    return usuariosStr ? JSON.parse(usuariosStr) : [];
  }

  // ➕ Agregar nuevo usuario
  agregarUsuario(): void {
    console.log('➕ Agregar nuevo usuario');
    // TODO: Implementar modal o navegación a formulario
    alert('Función de agregar usuario próximamente disponible');
  }

  // 🎯 Manejar acciones de la tabla
  onTableAction(event: { action: string, item: any }): void {
    const usuario = event.item as Usuario;
    
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

  // 👁️ Ver detalles del usuario
  private verUsuario(usuario: Usuario): void {
    console.log('👁️ Ver usuario:', usuario);
    const detalles = `
Usuario: ${usuario.nombre}
Email: ${usuario.email}
Rol: ${usuario.rol}
Teléfono: ${usuario.telefono}
Documento: ${usuario.tipoDocumento} - ${usuario.numeroDocumento}
    `;
    alert(detalles);
  }

  // ✏️ Editar usuario
  private editarUsuario(usuario: Usuario): void {
    console.log('✏️ Editar usuario:', usuario);
    // TODO: Implementar modal o navegación a formulario de edición
    alert('Función de editar usuario próximamente disponible');
  }

  // 🗑️ Eliminar usuario
  private eliminarUsuario(usuario: Usuario): void {
    // Proteger usuario admin
    if (usuario.rol === 'admin' && usuario.email === 'admin@gmail.com') {
      alert('No se puede eliminar el usuario administrador principal');
      return;
    }
    
    const confirmacion = confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre}?`);
    
    if (confirmacion) {
      const usuarios = this.obtenerUsuarios();
      const usuariosActualizados = usuarios.filter(u => u.id !== usuario.id);
      
      localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados));
      this.cargarUsuarios();
      
      console.log('🗑️ Usuario eliminado:', usuario.nombre);
    }
  }

  // 🔐 Resetear password del usuario
  private resetearPassword(usuario: Usuario): void {
    const confirmacion = confirm(`¿Resetear la contraseña de ${usuario.nombre}?`);
    
    if (confirmacion) {
      const usuarios = this.obtenerUsuarios();
      const usuarioIndex = usuarios.findIndex(u => u.id === usuario.id);
      
      if (usuarioIndex !== -1) {
        // Generar nueva contraseña temporal
        const nuevaPassword = 'temp123';
        usuarios[usuarioIndex].password = nuevaPassword;
        
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        this.cargarUsuarios();
        
        alert(`Contraseña reseteada para ${usuario.nombre}\\nNueva contraseña temporal: ${nuevaPassword}`);
        console.log('🔐 Password reseteado para:', usuario.nombre);
      }
    }
  }

  // 🔄 Manejar cambios de ordenamiento
  onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
    console.log('🔄 Ordenar por:', event.column, event.direction);
    // El DataTableComponent maneja el ordenamiento internamente
  }

  // 🎨 Obtener clase CSS para el rol
  getRolClass(rol: string): string {
    switch (rol) {
      case 'admin': return 'rol-admin';
      case 'doctor': return 'rol-doctor';
      case 'paciente': return 'rol-paciente';
      default: return 'rol-default';
    }
  }
}
