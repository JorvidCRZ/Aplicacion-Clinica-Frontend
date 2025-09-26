import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiMascotaCardComponent } from './mi-mascota-card.component';

describe('MiMascotaCardComponent', () => {
  let component: MiMascotaCardComponent;
  let fixture: ComponentFixture<MiMascotaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiMascotaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiMascotaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
