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

    // Filtrar los elementos que coinciden
    const elementosFiltrados = this.data.filter(item => {
      const valor = this.key ? item[this.key] : item;
      return this.normalize(String(valor)).includes(textoNormalizado);
    });

    // Generar sugerencias como strings únicos
    this.sugerencias = [...new Set(elementosFiltrados.map(item => {
      return this.key ? item[this.key] : item;
    }))].slice(0, 5); // Limitar a 5 sugerencias

    this.resultado.emit(elementosFiltrados);
  }

  seleccionar(valorSeleccionado: string) {
    this.texto = valorSeleccionado;
    
    // Encontrar todos los elementos que coinciden con el valor seleccionado
    const elementosCoincidentes = this.data.filter(item => {
      const valor = this.key ? item[this.key] : item;
      return String(valor).toLowerCase() === valorSeleccionado.toLowerCase();
    });
    
    this.resultado.emit(elementosCoincidentes);
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