import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BuscadorComponent } from '../../../../shared/components/buscador/buscador.component';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, BuscadorComponent],
  templateUrl: './especialidades.component.html',
  styleUrl: './especialidades.component.css'
})
export class EspecialidadesComponent implements OnInit {
  especialidades: any[] = [];
  especialidadesFiltradas: any[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Aquí simulas el consumo de tu API con un array de prueba
    this.especialidades = [
      { id: 0, nombre: 'Medicina General', descripcion: 'Atención primaria y preventiva para todas las edades.' },
      { id: 1, nombre: 'Cardiología', descripcion: 'Cuidado del corazón y sistema circulatorio.' },
      { id: 2, nombre: 'Dermatología', descripcion: 'Tratamiento de la piel, cabello y uñas.' },
      { id: 3, nombre: 'Pediatría', descripcion: 'Atención médica para niños y adolescentes.' },
      { id: 4, nombre: 'Ginecología', descripcion: 'Salud reproductiva y sistema femenino.' },
      { id: 5, nombre: 'Traumatología', descripcion: 'Lesiones óseas, musculares y articulares.' },
      { id: 6, nombre: 'Oftalmología', descripcion: 'Diagnóstico y tratamiento de problemas oculares.' },
      { id: 7, nombre: 'Odontología', descripcion: 'Salud dental y cuidado bucal.' },
      { id: 8, nombre: 'Neurología', descripcion: 'Sistema nervioso y trastornos neurológicos.' },
      { id: 9, nombre: 'Endocrinología', descripcion: 'Glándulas y hormonas en el cuerpo.' },
      { id: 10, nombre: 'Reumatología', descripcion: 'Enfermedades de articulaciones y tejidos blandos.' },
      { id: 11, nombre: 'Psiquiatría', descripcion: 'Salud mental y emocional.' },
      { id: 12, nombre: 'Urología', descripcion: 'Sistema urinario y aparato reproductor masculino.' }
    ];

    // Inicializamos la lista filtrada
    this.especialidadesFiltradas = [...this.especialidades];
  }

  onBuscarResultados(resultados: any[]): void {
    this.especialidadesFiltradas = resultados;
  }

  verDetalle(esp: any): void {
    // Navega a la ruta de doctores pasando el id de la especialidad
    this.router.navigate(['/citas', esp.nombre]);
  }
}