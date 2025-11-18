import { RouterLink } from "@angular/router";
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Card } from '../../../../core/models/utils/card';
import { CardGalleryComponent } from '../../../../shared/components/card-gallery/card-gallery.component';
import { BannerComponent } from "../../../../shared/components/banner/banner.component";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [BannerComponent, RouterLink, CardGalleryComponent],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {
  @ViewChild('imagen') imagen!: ElementRef<HTMLImageElement>;

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.imagen.nativeElement.classList.add('visible');
          }
        });
      },
      { threshold: 0.5 }
    );

    if (this.imagen) {
      observer.observe(this.imagen.nativeElement);
    }
  }

  title: string = 'Nuestras Especialidades';
  URL: string = 'assets/galeria/inicio/icono';
  servicios: Card[] = [
    { id: 1, title: 'Cardiologia', description: 'Control y prevención de enfermedades cardíacas.', image: `${this.URL}1.webp` },
    { id: 2, title: 'Pediatria', description: 'Cuida la salud de los más pequeños de la casa.', image: `${this.URL}2.webp`  },
    { id: 3, title: 'Laboratorio', description: 'Resultados precisos y confiables para tu diagnóstico.', image: `${this.URL}3.webp` }
  ];
}

