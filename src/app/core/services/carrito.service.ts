import { Injectable } from '@angular/core';

export interface ProductoCarrito {
  idproducto: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private storageKey = 'carritocompras';

  getCarrito(): ProductoCarrito[] {
    const data = sessionStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  guardarCarrito(carrito: ProductoCarrito[]): void {
    sessionStorage.setItem(this.storageKey, JSON.stringify(carrito));
  }

  agregarProducto(producto: ProductoCarrito): void {
    const carrito = this.getCarrito();
    const existente = carrito.find(item => item.idproducto === producto.idproducto);

    if (existente) {
      existente.cantidad += producto.cantidad;
    } else {
      carrito.push(producto);
    }

    this.guardarCarrito(carrito);
  }

  vaciarCarrito(): void {
    sessionStorage.removeItem(this.storageKey);
  }



  bloquearDecimales(event: KeyboardEvent) {
    if (event.key === '.' || event.key === ',') {
      event.preventDefault();
    }
  }
}
