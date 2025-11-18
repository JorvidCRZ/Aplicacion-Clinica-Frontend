import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BuscadorComponent } from '../../../../shared/components/buscador/buscador.component';
import { EspecialidadService, Especialidad } from '../../../../core/services/pages/especialidad.service';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, BuscadorComponent],
  templateUrl: './especialidades.component.html',
  styleUrls: ['./especialidades.component.css']
})
export class EspecialidadesComponent implements OnInit {
  especialidades: Especialidad[] = [];
  especialidadesFiltradas: Especialidad[] = [];
  private especialidadService = inject(EspecialidadService);
  private router = inject(Router);

  ngOnInit(): void {
    this.especialidadService.getEspecialidades().subscribe((data: Especialidad[]) => {
      this.especialidades = data;
      this.especialidadesFiltradas = [...this.especialidades];
      // Debug de las URLs de imagen
      this.especialidades.forEach(e => console.log('URL icono:', e.urlImgIcono));
    });
  }

  onBuscarResultados(resultados: Especialidad[]): void {
    this.especialidadesFiltradas = resultados;
  }

  verDetalle(esp: Especialidad): void {
  this.router.navigate(['/especialidadportada', esp.idEspecialidad]);
  }
}