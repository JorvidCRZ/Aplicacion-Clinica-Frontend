import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarritoService, ProductoCarrito } from '../../../core/services/carrito.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  checkoutForm: FormGroup;
  pagoExitoso: boolean | null = null;
  mostrarTarjeta: boolean = false;
  mostrarYape: boolean = true;
  carrito: ProductoCarrito[] = [];

  constructor(private fb: FormBuilder, private carritoService: CarritoService) {
    const usuarioActivoStr = localStorage.getItem('usuarioActivo');
    const usuarioActivo = usuarioActivoStr ? JSON.parse(usuarioActivoStr) : null;

    this.checkoutForm = this.fb.group({
      nombre: [usuarioActivo?.nombre || '', Validators.required],
      email: [usuarioActivo?.email || '', [Validators.required, Validators.email]],
      telefono: [usuarioActivo?.telefono || '', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      direccion: ['', Validators.required],
      metodoPago: ['YAPE', Validators.required],
      numeroYape: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      numeroTarjeta: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      fechaVencimiento: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/(\d{2})$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });

    this.toggleMetodoPago();
    this.carrito = this.carritoService.getCarrito();
  }

  get total(): number {
    return this.carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  toggleMetodoPago() {
    this.checkoutForm.get('metodoPago')?.valueChanges.subscribe(value => {
      this.mostrarTarjeta = value === 'Tarjeta';
      this.mostrarYape = value === 'YAPE';
      if (!this.mostrarTarjeta) {
        this.checkoutForm.get('numeroTarjeta')?.reset();
        this.checkoutForm.get('cvv')?.reset();
        this.checkoutForm.get('fechaVencimiento')?.reset();
      }
      if (!this.mostrarYape) {
        this.checkoutForm.get('numeroYape')?.reset();
      }
    });
  }

  confirmarPago() {
    if (this.checkoutForm.get('metodoPago')?.value === 'YAPE') {
      if (
        this.checkoutForm.get('nombre')?.invalid ||
        this.checkoutForm.get('email')?.invalid ||
        this.checkoutForm.get('direccion')?.invalid ||
        this.checkoutForm.get('numeroYape')?.invalid
      ) {
        this.pagoExitoso = false;
        return;
      }
    } else if (this.checkoutForm.get('metodoPago')?.value === 'Tarjeta') {
      if (
        this.checkoutForm.get('nombre')?.invalid ||
        this.checkoutForm.get('email')?.invalid ||
        this.checkoutForm.get('direccion')?.invalid ||
        this.checkoutForm.get('numeroTarjeta')?.invalid ||
        this.checkoutForm.get('fechaVencimiento')?.invalid ||
        this.checkoutForm.get('cvv')?.invalid
      ) {
        this.pagoExitoso = false;
        return;
      }
    } else {
      this.pagoExitoso = false;
      return;
    }
    this.pagoExitoso = true;
    // Vacía el carrito y actualiza el resumen
    this.carritoService.vaciarCarrito();
    this.carrito = [];
  }
}
