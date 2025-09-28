import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CarritoService, ProductoCarrito } from '../../../../core/services/carrito.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  carrito: ProductoCarrito[] = [];
  productos: ProductoCarrito[] = [];
  logueado: boolean = false;

  constructor(
    private carritoService: CarritoService, 
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.carrito = this.carritoService.getCarrito();
    this.logueado = this.authService.isLoggedIn();
  }

  get total(): number {
    return this.carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  actualizarCantidad(): void {
    this.carritoService.guardarCarrito(this.carrito);
  }

  eliminarItem(index: number): void {
    this.carrito.splice(index, 1);
    this.carritoService.guardarCarrito(this.carrito);
  }

  vaciarCarrito(): void {
    this.carrito = [];
    this.carritoService.vaciarCarrito();
  }

  puedePagar(): boolean {
    if (!this.carrito.length) return false;
    return this.carrito.every(item => item.cantidad > 0);
  }

  pagar() {
    if (this.authService.requireAuth('/checkout')) {
      this.router.navigate(['/checkout']);
    }
    // Si no está autenticado, requireAuth ya lo redirige al login
  }
}
