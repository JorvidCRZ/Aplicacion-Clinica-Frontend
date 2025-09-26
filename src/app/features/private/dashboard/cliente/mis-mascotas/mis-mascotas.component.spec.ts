import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisMascotasComponent } from './mis-mascotas.component';

describe('MisMascotasComponent', () => {
  let component: MisMascotasComponent;
  let fixture: ComponentFixture<MisMascotasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisMascotasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisMascotasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
