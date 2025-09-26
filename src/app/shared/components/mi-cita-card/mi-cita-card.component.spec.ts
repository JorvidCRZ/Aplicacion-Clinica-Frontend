import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiCitaCardComponent } from './mi-cita-card.component';

describe('MiCitaCardComponent', () => {
  let component: MiCitaCardComponent;
  let fixture: ComponentFixture<MiCitaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiCitaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiCitaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
