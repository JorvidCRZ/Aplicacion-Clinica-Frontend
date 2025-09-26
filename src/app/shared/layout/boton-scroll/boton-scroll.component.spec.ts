import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonScrollComponent } from './boton-scroll.component';

describe('BotonScrollComponent', () => {
  let component: BotonScrollComponent;
  let fixture: ComponentFixture<BotonScrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonScrollComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotonScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
