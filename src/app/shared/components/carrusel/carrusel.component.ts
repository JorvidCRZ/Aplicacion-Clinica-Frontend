import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Slide } from '../../../core/models/common/slide';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel.component.html',
  styleUrl: './carrusel.component.css'
})

export class CarruselComponent {
  slides: Slide[] = [
    { id: 1, image: 'assets/carrusel/slides/slide1.webp', title: 'Felipe', description: 'Felipe' },
    { id: 2, image: 'assets/carrusel/slides/slide2.webp', title: 'Max', description: 'Max' },
    { id: 3, image: 'assets/carrusel/slides/slide3.webp', title: 'Jerry', description: 'Jerry' },
    { id: 4, image: 'assets/carrusel/slides/slide4.webp', title: 'Tom', description: 'Tom' },
    { id: 5, image: 'assets/carrusel/slides/slide5.webp', title: 'Luna', description: 'Luna' },
    { id: 6, image: 'assets/carrusel/slides/slide6.webp', title: 'Rocky', description: 'Rocky' },
    { id: 7, image: 'assets/carrusel/slides/slide7.webp', title: 'Pepe', description: 'Pepe' },
    { id: 8, image: 'assets/carrusel/slides/slide8.webp', title: 'Rayo', description: 'Rayo' },
    { id: 9, image: 'assets/carrusel/slides/slide9.webp', title: 'Pelusa', description: 'Pelusa' },
    { id: 10, image: 'assets/carrusel/slides/slide10.webp', title: 'Luli', description: 'Luli' }
  ];


  startIndex = 0;
  visibleCount = 5;

  ngOnInit() {
    this.setVisibleCount(window.innerWidth);
    window.addEventListener('resize', () => {
      this.setVisibleCount(window.innerWidth);
    });
  }

  setVisibleCount(width: number) {
    if (width < 576) {
      this.visibleCount = 1;
    } else if (width < 768) {
      this.visibleCount = 2;
    } else if (width < 992) {
      this.visibleCount = 3;
    } else if (width < 1200) {
      this.visibleCount = 4;
    } else {
      this.visibleCount = 5;
    }
  }

  get slidesVisibles() {
    let visibles: any[] = [];
    for (let i = 0; i < this.visibleCount; i++) {
      visibles.push(this.slides[(this.startIndex + i) % this.slides.length]);
    }
    return visibles;
  }

  siguiente() {
    this.startIndex = (this.startIndex + 1) % this.slides.length;
  }

  anterior() {
    this.startIndex =
      (this.startIndex - 1 + this.slides.length) % this.slides.length;
  }
}