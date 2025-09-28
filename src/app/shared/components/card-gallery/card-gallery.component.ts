import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Card } from '../../../core/models/utils/card';
import { CardComponent } from '../card/card.component';


@Component({
  selector: 'app-card-gallery',
  standalone: true,
  imports: [CommonModule,CardComponent],
  templateUrl: './card-gallery.component.html',
  styleUrl: './card-gallery.component.css'
})

export class CardGalleryComponent {
  @Input() items: Card[] = [];
  @Input() title: string = '';
}
