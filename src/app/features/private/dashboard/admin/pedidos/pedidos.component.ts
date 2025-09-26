import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';


export interface MiPedido {
  id: string;
  fechaPedido: Date;
  estado: string;
  total: number;
  productos: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  direccionEntrega: string;
  metodoPago: string;
  fechaEntrega?: Date;
}

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent implements OnInit {
  pedidos: MiPedido[] = [];
  pedidosFiltrados: MiPedido[] = [];
  searchTerm: string = '';
  filtroEstado: string = '';
  mostrarModal: boolean = false;
  pedidoEditando: MiPedido | null = null;
  
  // Estadísticas
  stats = {
    totalPedidos: 0,
    pendiente: 0,
    enviados: 0,
    entregados: 0,
    procesados: 0,
    cancelados: 0,
    valorTotal: 0
  };

  // Estados disponibles
  estados = [
    'Pendiente',
    'Procesando', 
    'Enviado',
    'Entregado',
    'Cancelado'
  ];

  ngOnInit(): void {
    this.cargarPedidos();
    this.calcularEstadisticas();
  }

  cargarPedidos(): void {
    // Cargar pedidos del localStorage
    const pedidosStr = localStorage.getItem('pedidos');
    if (pedidosStr) {
      this.pedidos = JSON.parse(pedidosStr);
      // Convertir fechas de string a Date si es necesario
      this.pedidos.forEach(pedido => {
        if (typeof pedido.fechaPedido === 'string') {
          pedido.fechaPedido = new Date(pedido.fechaPedido);
        }
        if (pedido.fechaEntrega && typeof pedido.fechaEntrega === 'string') {
          pedido.fechaEntrega = new Date(pedido.fechaEntrega);
        }
      });
    } else {
      // Pedidos de ejemplo basados en la imagen
      this.pedidos = [
        {
          id: 'ORD-001',
          fechaPedido: new Date('2024-01-05'),
          estado: 'Pendiente',
          total: 89.99,
          productos: [
            { nombre: 'Alimento Premium Perro X2', cantidad: 2, precio: 34.99 },
            { nombre: 'Juguete Interactivo XL', cantidad: 1, precio: 19.99 }
          ],
          direccionEntrega: 'maria@email.com',
          metodoPago: 'Tarjeta de Crédito'
        },
        {
          id: 'ORD-002',
          fechaPedido: new Date('2024-01-04'),
          estado: 'Enviado',
          total: 156.5,
          productos: [
            { nombre: 'Collar Antipulgas', cantidad: 1, precio: 15.99 },
            { nombre: 'Vitaminas para Gatos', cantidad: 2, precio: 35.75 }
          ],
          direccionEntrega: 'carlos@email.com',
          metodoPago: 'Yape'
        },
        {
          id: 'ORD-003',
          fechaPedido: new Date('2024-01-03'),
          estado: 'Entregado',
          total: 234.80,
          productos: [
            { nombre: 'Cama Premium para Perros', cantidad: 1, precio: 89.99 },
            { nombre: 'Transportadora Mediana', cantidad: 1, precio: 144.81 }
          ],
          direccionEntrega: 'ana@email.com',
          metodoPago: 'Transferencia'
        },
        {
          id: 'ORD-004',
          fechaPedido: new Date('2024-01-02'),
          estado: 'Procesando',
          total: 67.25,
          productos: [
            { nombre: 'Snacks Naturales', cantidad: 3, precio: 12.50 },
            { nombre: 'Galletas para Perros', cantidad: 2, precio: 15.75 }
          ],
          direccionEntrega: 'luis@email.com',
          metodoPago: 'Tarjeta de Débito'
        }
      ];
      
    }
    this.pedidosFiltrados = [...this.pedidos];
  }

  calcularEstadisticas(): void {
    this.stats.totalPedidos = this.pedidos.length;
    this.stats.pendiente = this.pedidos.filter(p => p.estado === 'Pendiente').length;
    this.stats.enviados = this.pedidos.filter(p => p.estado === 'Enviado').length;
    this.stats.entregados = this.pedidos.filter(p => p.estado === 'Entregado').length;
    this.stats.procesados = this.pedidos.filter(p => p.estado === 'Procesando').length;
    this.stats.cancelados = this.pedidos.filter(p => p.estado === 'Cancelado').length;
    this.stats.valorTotal = this.pedidos.reduce((total, p) => total + p.total, 0);
  }

  filtrarPedidos(): void {
    let pedidosFiltrados = this.pedidos;
    
    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      pedidosFiltrados = pedidosFiltrados.filter(pedido =>
        pedido.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pedido.direccionEntrega.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pedido.productos.some((p: any) => p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    
    // Filtrar por estado
    if (this.filtroEstado) {
      pedidosFiltrados = pedidosFiltrados.filter(pedido =>
        pedido.estado === this.filtroEstado
      );
    }
    
    this.pedidosFiltrados = pedidosFiltrados;
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = '';
    this.pedidosFiltrados = [...this.pedidos];
  }

  abrirModalNuevo(): void {
    this.pedidoEditando = null;
    this.mostrarModal = true;
  }

  editarPedido(pedido: MiPedido): void {
    this.pedidoEditando = { ...pedido };
    this.mostrarModal = true;
  }

  cambiarEstado(pedido: MiPedido, nuevoEstado: string): void {
    const index = this.pedidos.findIndex(p => p.id === pedido.id);
    if (index !== -1) {
      this.pedidos[index].estado = nuevoEstado;
      this.guardarEnLocalStorage();
      this.filtrarPedidos();
      this.calcularEstadisticas();
    }
  }

  eliminarPedido(pedido: MiPedido): void {
    if (confirm(`¿Estás seguro de eliminar el pedido ${pedido.id}?`)) {
      this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
      this.filtrarPedidos();
      this.calcularEstadisticas();
      this.guardarEnLocalStorage();
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.pedidoEditando = null;
  }

  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'badge-pendiente';
      case 'Procesando':
        return 'badge-procesando';
      case 'Enviado':
        return 'badge-enviado';
      case 'Entregado':
        return 'badge-entregado';
      case 'Cancelado':
        return 'badge-cancelado';
      default:
        return 'badge-pendiente';
    }
  }

  formatPrice(price: number): string {
    return `S/${price.toFixed(2)}`;
  }

  calcularPrecioUnitario(pedido: MiPedido): number {
    const totalCantidad = pedido.productos.reduce((sum: number, p: any) => sum + p.cantidad, 0);
    return totalCantidad > 0 ? pedido.total / totalCantidad : 0;
  }

  generarNuevoId(): string {
    return 'ORD-' + Date.now().toString().slice(-6);
  }

  exportarPedidos(): void {
    // Funcionalidad de exportación
    const dataStr = JSON.stringify(this.pedidosFiltrados, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pedidos.json';
    link.click();
  }

  private guardarEnLocalStorage(): void {
    localStorage.setItem('pedidos', JSON.stringify(this.pedidos));
  }
}
