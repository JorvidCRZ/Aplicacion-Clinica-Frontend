import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EspecialidadService, Especialidad } from '../../../../servicesApi/especialidad.service';
import { SubespecialidadService, Subespecialidad } from '../../../../servicesApi/subespecialidad.service';

@Component({
  selector: 'app-especialidadportada',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './especialidadportada.html',
  styleUrl: './especialidadportada.css'
})
export class Especialidadportada implements OnInit {
  private route = inject(ActivatedRoute);
  private especialidadService = inject(EspecialidadService);
  private subespecialidadService = inject(SubespecialidadService);
  private router = inject(Router);

  especialidad: Especialidad | null = null;
  subespecialidades: Subespecialidad[] = [];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('idEspecialidad'));
    if (id) {
      this.especialidadService.getEspecialidad(id).subscribe((esp) => {
        this.especialidad = esp;
      });
      this.subespecialidadService.getSubespecialidadesPorEspecialidad(id).subscribe((subs) => {
        this.subespecialidades = subs;
      });
    }
  }

  irACitas(sub: Subespecialidad) {
    // Buscar el nombre de la especialidad para filtrar en la página de citas
    const nombreEspecialidad = this.especialidad?.nombre || '';
    this.router.navigate(['/citas', nombreEspecialidad]);
  }
}
