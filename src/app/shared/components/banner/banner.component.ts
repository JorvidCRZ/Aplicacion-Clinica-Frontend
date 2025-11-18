import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Slide } from '../../../core/models/common/slide';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent {
  URL: string = 'assets/carrusel/banner/slide';
  slides: Slide[] = [
    {id: 1,image: `${this.URL}1.webp`, title: 'Atención médica integral',description: 'Atención médica integral con \nprofesionales altamente calificados'},
    {id: 2,image: `${this.URL}2.webp`,title: 'Cuidado a nuestros adultos mayores',description: 'Brindamos calidad de \nvida y atención especializada'},
    {id: 3,image: `${this.URL}3.webp`,title: 'Cuidado infantil',description: 'Porque la salud de los más \npequeños es nuestra prioridad'}
  ];
}

