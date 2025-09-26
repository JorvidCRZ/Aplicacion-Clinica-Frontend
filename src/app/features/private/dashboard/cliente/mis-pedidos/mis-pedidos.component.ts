import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MiPedido, MiPedidoCardComponent } from '../../../../../shared/components/mi-pedido-card/mi-pedido-card.component';


interface PedidoItem {
  id: string;
  nombreProducto: string;
  imagen: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

interface Pedido {
  id: string;
  fechaPedido: string;
  estado: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  total: number;
  numeroSeguimiento?: string;
  fechaEntrega?: string;
  direccionEntrega: string;
  metodoPago: string;
  items: PedidoItem[];
}

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, MiPedidoCardComponent],
  templateUrl: './mis-pedidos.component.html',
  styleUrl: './mis-pedidos.component.css'
})
export class MisPedidosComponent {
  pedidos: Pedido[] = [
    {
      id: 'PED-001',
      fechaPedido: '2025-08-28',
      estado: 'entregado',
      total: 185.50,
      numeroSeguimiento: 'TRK-789456123',
      fechaEntrega: '2025-08-30',
      direccionEntrega: 'Av. Los Pinos 123, Lima',
      metodoPago: 'Tarjeta de Crédito',
      items: [
        {
          id: '1',
          nombreProducto: 'Comida Premium para Perros',
          imagen: 'assets/productos/producto1.webp',
          precio: 89.90,
          cantidad: 2,
          subtotal: 179.80
        },
        {
          id: '2',
          nombreProducto: 'Juguete Interactivo',
          imagen: 'assets/productos/producto4.webp',
          precio: 25.90,
          cantidad: 1,
          subtotal: 25.90
        }
      ]
    },
    {
      id: 'PED-002',
      fechaPedido: '2025-09-01',
      estado: 'enviado',
      total: 156.80,
      numeroSeguimiento: 'TRK-987654321',
      direccionEntrega: 'Av. Los Pinos 123, Lima',
      metodoPago: 'Transferencia Bancaria',
      items: [
        {
          id: '3',
          nombreProducto: 'Arena Sanitaria para Gatos',
          imagen: 'assets/productos/producto3.webp',
          precio: 45.90,
          cantidad: 1,
          subtotal: 45.90
        },
        {
          id: '4',
          nombreProducto: 'Collar Antipulgas',
          imagen: 'assets/productos/producto5.webp',
          precio: 32.90,
          cantidad: 2,
          subtotal: 65.80
        },
        {
          id: '5',
          nombreProducto: 'Vitaminas para Mascotas',
          imagen: 'assets/productos/producto7.webp',
          precio: 45.10,
          cantidad: 1,
          subtotal: 45.10
        }
      ]
    },
    {
      id: 'PED-003',
      fechaPedido: '2025-09-03',
      estado: 'procesando',
      total: 234.70,
      direccionEntrega: 'Av. Los Pinos 123, Lima',
      metodoPago: 'PayPal',
      items: [
        {
          id: '6',
          nombreProducto: 'Cama Ortopédica para Mascotas',
          imagen: 'assets/productos/producto2.webp',
          precio: 189.90,
          cantidad: 1,
          subtotal: 189.90
        },
        {
          id: '7',
          nombreProducto: 'Shampoo Medicado',
          imagen: 'assets/productos/producto8.webp',
          precio: 29.90,
          cantidad: 1,
          subtotal: 29.90
        },
        {
          id: '8',
          nombreProducto: 'Correa Extensible',
          imagen: 'assets/productos/producto9.webp',
          precio: 14.90,
          cantidad: 1,
          subtotal: 14.90
        }
      ]
    },
    {
      id: 'PED-004',
      fechaPedido: '2025-09-04',
      estado: 'pendiente',
      total: 67.80,
      direccionEntrega: 'Av. Los Pinos 123, Lima',
      metodoPago: 'Contra Entrega',
      items: [
        {
          id: '9',
          nombreProducto: 'Snacks Naturales',
          imagen: 'assets/productos/producto6.webp',
          precio: 22.90,
          cantidad: 2,
          subtotal: 45.80
        },
        {
          id: '10',
          nombreProducto: 'Comedero Automático',
          imagen: 'assets/productos/producto1.webp',
          precio: 22.00,
          cantidad: 1,
          subtotal: 22.00
        }
      ]
    }
  ];

  // Método para contar pedidos por estado
  getCountByEstado(estado: string): number {
    return this.pedidos.filter(p => p.estado === estado).length;
  }

  // Método para obtener total de pedidos
  getTotalPedidos(): number {
    return this.pedidos.length;
  }

  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'entregado': return 'estado-entregado';
      case 'enviado': return 'estado-enviado';
      case 'procesando': return 'estado-procesando';
      case 'pendiente': return 'estado-pendiente';
      case 'cancelado': return 'estado-cancelado';
      default: return '';
    }
  }

  getEstadoTexto(estado: string): string {
    switch(estado) {
      case 'entregado': return 'Entregado';
      case 'enviado': return 'Enviado';
      case 'procesando': return 'Procesando';
      case 'pendiente': return 'Pendiente';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  }

  verDetalles(pedidoId: string) {
    console.log('Ver detalles del pedido:', pedidoId);
    // Aquí se puede implementar la navegación a una página de detalles
  }


  cancelarPedido(pedidoId: string) {
    if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      const pedido = this.pedidos.find(p => p.id === pedidoId);
      if (pedido && (pedido.estado === 'pendiente' || pedido.estado === 'procesando')) {
        pedido.estado = 'cancelado';
        console.log('Pedido cancelado:', pedidoId);
      }
    }
  }



  verDetallesPedido(pedido: MiPedido): void {
    console.log('Ver detalles del pedido:', pedido);
    // Implementar lógica para mostrar detalles del pedido
  }

  transformPedido(pedido: Pedido): MiPedido {
    return {
      id: pedido.id,
      fechaPedido: new Date(pedido.fechaPedido),
      estado: pedido.estado === 'procesando' ? 'en_proceso' : pedido.estado,
      total: pedido.total,
      productos: pedido.items.map(item => ({
        nombre: item.nombreProducto,
        cantidad: item.cantidad,
        precio: item.precio
      })),
      direccionEntrega: pedido.direccionEntrega,
      metodoPago: pedido.metodoPago,
      fechaEntrega: pedido.fechaEntrega ? new Date(pedido.fechaEntrega) : undefined
    };
  }
}
