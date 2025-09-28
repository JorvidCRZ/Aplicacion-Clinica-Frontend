import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador.component.html',
  styleUrls: ['./buscador.component.css']
})
export class BuscadorComponent {
  @Input() placeholder: string = "Buscar...";
  @Input() data: any[] = [];
  @Input() key: string = '';   
  @Output() resultado = new EventEmitter<any[]>();

  texto: string = "";
  sugerencias: string[] = [];

  private normalize(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  filtrar() {
    if (!this.texto) {
      this.sugerencias = [];
      this.resultado.emit(this.data);
      return;
    }

    const textoNormalizado = this.normalize(this.texto);

    this.sugerencias = this.data.filter(item => {
      const valor = this.key ? item[this.key] : item;
      return this.normalize(valor).includes(textoNormalizado);
    });

    this.resultado.emit(this.sugerencias);
  }

  seleccionar(opcion: any) {
    this.texto = this.key ? opcion[this.key] : opcion;
    this.resultado.emit([opcion]);
    this.sugerencias = [];
  }

  buscar() {
    if (this.texto.trim()) {
      this.filtrar();
    } else {
      this.resultado.emit(this.data);
    }
  }
}