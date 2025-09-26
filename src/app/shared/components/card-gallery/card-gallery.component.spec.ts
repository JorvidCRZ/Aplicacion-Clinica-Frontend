import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardGalleryComponent } from './card-gallery.component';

describe('CardGalleryComponent', () => {
  let component: CardGalleryComponent;
  let fixture: ComponentFixture<CardGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
