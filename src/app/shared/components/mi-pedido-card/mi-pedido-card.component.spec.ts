import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiPedidoCardComponent } from './mi-pedido-card.component';

describe('MiPedidoCardComponent', () => {
  let component: MiPedidoCardComponent;
  let fixture: ComponentFixture<MiPedidoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiPedidoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiPedidoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
