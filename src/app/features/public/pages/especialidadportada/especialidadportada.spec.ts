import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Especialidadportada } from './especialidadportada';

describe('Especialidadportada', () => {
  let component: Especialidadportada;
  let fixture: ComponentFixture<Especialidadportada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Especialidadportada]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Especialidadportada);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
