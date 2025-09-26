import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Product = any;
@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})

 
export class ProductosComponent implements OnInit {

  productos: Product[] = [];  
  productosFiltrados: Product[] = [];
  productoEditando: Product | null = null;

  searchTerm: string = '';
  mostrarModal: boolean = false;

  // Estadísticas
  stats = {
    totalProductos: 0,
    sinStock: 0,
    stockBajo: 0,
    valorInventario: 0
  };

  productoForm = {
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    stock: 0,
    inStock: true
  };

  categorias = [
    'Comida',
    'Accesorios',
    'Medicamentos',
    'Juguetes',
  ];

  ngOnInit(): void {
    this.cargarProductos();
    this.calcularEstadisticas();
  }

  cargarProductos(): void {
    // Cargar productos del localStorage
    const productosStr = localStorage.getItem('productos');
    if (productosStr) {
      this.productos = JSON.parse(productosStr);
    } else {
      // Productos de ejemplo basados en la imagen
      this.productos = [
        {
          id: 1,
          name: 'Alimento Premium para Perros',
          description: 'Alimento balanceado premium para perros adultos',
          price: 45.99,
          category: 'Comida',
          image: 'assets/productos/producto1.webp',
          stock: 50,
          inStock: true
        },
        {
          id: 2,
          name: 'Collar Antipulgas',
          description: 'Collar efectivo contra pulgas y garrapatas',
          price: 15.99,
          category: 'Accesorios',
          image: 'assets/productos/producto2.webp',
          stock: 30,
          inStock: true
        },
        {
          id: 3,
          name: 'Juguete Interactivo',
          description: 'Juguete educativo para estimulación mental',
          price: 25.50,
          category: 'Juguetes',
          image: 'assets/productos/producto4.webp',
          stock: 0,
          inStock: false
        },
        {
          id: 4,
          name: 'Vitaminas para Gatos',
          description: 'Suplemento vitamínico para gatos',
          price: 35.75,
          category: 'Medicamentos',
          image: 'assets/productos/producto3.webp',
          stock: 8,
          inStock: true
        }
      ];
    }
    this.productosFiltrados = [...this.productos];
  }

  calcularEstadisticas(): void {
    this.stats.totalProductos = this.productos.length;
    this.stats.sinStock = this.productos.filter(p => p.stock === 0).length;
    this.stats.stockBajo = this.productos.filter(p => p.stock > 0 && p.stock <= 10).length;
    this.stats.valorInventario = this.productos.reduce((total, p) => total + (p.price * p.stock), 0);
  }

  filtrarProductos(): void {
    if (!this.searchTerm) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    this.productosFiltrados = this.productos.filter(producto =>
      producto.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      producto.category.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      producto.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  abrirModalNuevo(): void {
    this.productoEditando = null;
    this.productoForm = {
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      stock: 0,
      inStock: true
    };
    this.mostrarModal = true;
  }

  editarProducto(producto: Product): void {
    this.productoEditando = producto;
    this.productoForm = {
      name: producto.name,
      description: producto.description,
      price: producto.price,
      category: producto.category,
      image: producto.image || '',
      stock: producto.stock,
      inStock: producto.inStock
    };
    this.mostrarModal = true;
  }

  eliminarProducto(producto: Product): void {
    if (confirm(`¿Estás seguro de eliminar ${producto.name}?`)) {
      this.productos = this.productos.filter(p => p.id !== producto.id);
      this.filtrarProductos();
      this.calcularEstadisticas();
      this.guardarEnLocalStorage();
    }
  }

  guardarProducto(): void {
    if (this.productoEditando) {
      // Actualizar producto existente
      const index = this.productos.findIndex(p => p.id === this.productoEditando!.id);
      if (index !== -1) {
        this.productos[index] = {
          id: this.productos[index].id,
          name: this.productoForm.name,
          description: this.productoForm.description,
          price: this.productoForm.price,
          category: this.productoForm.category,
          image: this.productoForm.image,
          stock: this.productoForm.stock,
          inStock: this.productoForm.inStock
        };
      }
    } else {
      // Crear nuevo producto
      const nuevoProducto: Product = {
        id: this.productos.length > 0 ? Math.max(...this.productos.map(p => p.id)) + 1 : 1,
        name: this.productoForm.name,
        description: this.productoForm.description,
        price: this.productoForm.price,
        category: this.productoForm.category,
        image: this.productoForm.image,
        stock: this.productoForm.stock,
        inStock: this.productoForm.inStock
      };
      this.productos.push(nuevoProducto);
    }

    this.filtrarProductos();
    this.calcularEstadisticas();
    this.guardarEnLocalStorage();
    this.cerrarModal();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.productoEditando = null;
  }

  getStockBadgeClass(stock: number): string {
    if (stock === 0) return 'badge-sin-stock';
    if (stock <= 10) return 'badge-stock-bajo';
    return 'badge-en-stock';
  }

  getStockText(stock: number): string {
    if (stock === 0) return 'Sin Stock';
    if (stock <= 10) return 'Stock Bajo';
    return 'En Stock';
  }

  getCategoryBadgeClass(category: string): string {
    return `categoria-${category.toLowerCase()}`;
  }

  formatPrice(price: number): string {
    return `S/${price.toFixed(2)}`;
  }

  private guardarEnLocalStorage(): void {
    localStorage.setItem('productos', JSON.stringify(this.productos));
  }
}
