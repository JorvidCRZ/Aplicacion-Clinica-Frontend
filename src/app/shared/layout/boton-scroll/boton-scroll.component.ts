import { Component } from '@angular/core';

@Component({
  selector: 'app-boton-scroll',
  standalone: true,
  imports: [],
  templateUrl: './boton-scroll.component.html',
  styleUrl: './boton-scroll.component.css'
})
export class BotonScrollComponent {
  scrollToTop() {
    document.getElementById('enlaces-inicio')?.scrollIntoView({ behavior: 'smooth' });
  }
}
