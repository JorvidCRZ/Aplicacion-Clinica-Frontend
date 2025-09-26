import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisCitasComponent } from './mis-citas.component';

describe('MisCitasComponent', () => {
  let component: MisCitasComponent;
  let fixture: ComponentFixture<MisCitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisCitasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisCitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
