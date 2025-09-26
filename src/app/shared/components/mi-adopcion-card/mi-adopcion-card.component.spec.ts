import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiAdopcionCardComponent } from './mi-adopcion-card.component';

describe('MiAdopcionCardComponent', () => {
  let component: MiAdopcionCardComponent;
  let fixture: ComponentFixture<MiAdopcionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiAdopcionCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiAdopcionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
