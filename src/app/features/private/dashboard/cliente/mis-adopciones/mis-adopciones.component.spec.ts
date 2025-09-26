import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisAdopcionesComponent } from './mis-adopciones.component';

describe('MisAdopcionesComponent', () => {
  let component: MisAdopcionesComponent;
  let fixture: ComponentFixture<MisAdopcionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisAdopcionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisAdopcionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
