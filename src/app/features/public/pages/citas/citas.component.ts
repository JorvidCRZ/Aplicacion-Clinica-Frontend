import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuscadorComponent } from '../../../../shared/components/buscador/buscador.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, BuscadorComponent],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})

export class CitasComponent implements OnInit {
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idEspecialidad = params.get('idEspecialidad');
      if (idEspecialidad) {
        this.selectedEspecialidad = idEspecialidad.toLowerCase();
      }
    });
  }

  citas = [
    // 🫀 Cardiología
    { doctor: 'Dr. Juan Pérez', especialidad: 'Cardiología', paciente: 'Luis Torres', disponibilidad: ['10:00 AM', '11:00 AM', '3:00 PM'] },
    { doctor: 'Dra. Carmen Aguilar', especialidad: 'Cardiología', paciente: 'Rosa Fernández', disponibilidad: ['9:00 AM', '1:00 PM', '4:30 PM'] },
    { doctor: 'Dr. Jorge Medina', especialidad: 'Cardiología', paciente: 'Pedro Gutiérrez', disponibilidad: ['8:30 AM', '2:00 PM'] },
    { doctor: 'Dra. Laura Campos', especialidad: 'Cardiología', paciente: 'Elena Díaz', disponibilidad: ['12:00 PM', '5:15 PM'] },

    // 🌿 Dermatología
    { doctor: 'Dra. María López', especialidad: 'Dermatología', paciente: 'Ana Castillo', disponibilidad: ['2:00 PM', '4:30 PM'] },
    { doctor: 'Dr. Luis Romero', especialidad: 'Dermatología', paciente: 'Carlos Vargas', disponibilidad: ['9:45 AM', '3:00 PM'] },
    { doctor: 'Dra. Silvia Torres', especialidad: 'Dermatología', paciente: 'Julia Herrera', disponibilidad: ['10:15 AM', '1:30 PM', '6:00 PM'] },
    { doctor: 'Dr. Daniel Flores', especialidad: 'Dermatología', paciente: 'Gabriela Rojas', disponibilidad: ['11:00 AM', '5:00 PM'] },

    // 🦴 Traumatología
    { doctor: 'Dr. Ricardo Morales', especialidad: 'Traumatología', paciente: 'Raúl Peña', disponibilidad: ['9:00 AM', '11:30 AM', '2:00 PM'] },
    { doctor: 'Dra. Patricia Sánchez', especialidad: 'Traumatología', paciente: 'Andrea Salas', disponibilidad: ['8:15 AM', '3:15 PM'] },
    { doctor: 'Dr. Esteban Cruz', especialidad: 'Traumatología', paciente: 'Héctor Ramos', disponibilidad: ['10:45 AM', '4:00 PM'] },
    { doctor: 'Dra. Fabiola Herrera', especialidad: 'Traumatología', paciente: 'Marcelo Paredes', disponibilidad: ['12:30 PM', '6:15 PM'] },

    // 👁️ Oftalmología
    { doctor: 'Dr. Alberto Gómez', especialidad: 'Oftalmología', paciente: 'Diego Fernández', disponibilidad: ['11:15 AM', '4:00 PM'] },
    { doctor: 'Dra. Carolina Vega', especialidad: 'Oftalmología', paciente: 'Sofía Delgado', disponibilidad: ['9:30 AM', '1:00 PM'] },
    { doctor: 'Dr. Martín Cárdenas', especialidad: 'Oftalmología', paciente: 'Paola Ruiz', disponibilidad: ['8:00 AM', '12:15 PM', '5:30 PM'] },
    { doctor: 'Dra. Elena Quispe', especialidad: 'Oftalmología', paciente: 'Rodrigo Mendoza', disponibilidad: ['2:45 PM', '6:00 PM'] },

    // 👩‍🍼 Ginecología
    { doctor: 'Dra. Sofía Medina', especialidad: 'Ginecología', paciente: 'Carmen Ruiz', disponibilidad: ['8:00 AM', '12:15 PM', '5:00 PM'] },
    { doctor: 'Dr. Andrés Navarro', especialidad: 'Ginecología', paciente: 'Lucía Morales', disponibilidad: ['9:45 AM', '2:30 PM'] },
    { doctor: 'Dra. Teresa Chávez', especialidad: 'Ginecología', paciente: 'Milagros Castillo', disponibilidad: ['10:30 AM', '4:45 PM'] },
    { doctor: 'Dr. Javier Campos', especialidad: 'Ginecología', paciente: 'Verónica Salazar', disponibilidad: ['11:15 AM', '3:15 PM'] },

    // 🧒 Pediatría
    { doctor: 'Dr. Carlos Ramos', especialidad: 'Pediatría', paciente: 'Miguel Díaz', disponibilidad: ['9:30 AM', '1:00 PM'] },
    { doctor: 'Dra. Natalia Guzmán', especialidad: 'Pediatría', paciente: 'Valeria Flores', disponibilidad: ['8:45 AM', '12:00 PM', '5:00 PM'] },
    { doctor: 'Dr. Felipe Lozano', especialidad: 'Pediatría', paciente: 'Esteban Bravo', disponibilidad: ['10:00 AM', '2:15 PM'] },
    { doctor: 'Dra. Andrea Torres', especialidad: 'Pediatría', paciente: 'Camila Serrano', disponibilidad: ['11:30 AM', '4:00 PM'] },

    // 🩺 Medicina General
    { doctor: 'Dr. Mario Vargas', especialidad: 'Medicina General', paciente: 'Fernando Ríos', disponibilidad: ['8:00 AM', '10:30 AM', '1:00 PM'] },
    { doctor: 'Dra. Beatriz Acosta', especialidad: 'Medicina General', paciente: 'Claudia Romero', disponibilidad: ['9:15 AM', '3:45 PM'] },
    { doctor: 'Dr. Julio Castañeda', especialidad: 'Medicina General', paciente: 'Ignacio Torres', disponibilidad: ['11:00 AM', '5:30 PM'] },
    { doctor: 'Dra. Gabriela Núñez', especialidad: 'Medicina General', paciente: 'Álvaro Quispe', disponibilidad: ['2:00 PM', '6:15 PM'] },

    // 😬 Odontología
    { doctor: 'Dra. Paula Benítez', especialidad: 'Odontología', paciente: 'Liliana Vargas', disponibilidad: ['9:00 AM', '11:30 AM', '2:45 PM'] },
    { doctor: 'Dr. Ernesto Salazar', especialidad: 'Odontología', paciente: 'Hugo Castro', disponibilidad: ['8:30 AM', '1:15 PM'] },
    { doctor: 'Dra. Valentina Rojas', especialidad: 'Odontología', paciente: 'Mariana Peña', disponibilidad: ['10:15 AM', '4:00 PM'] },
    { doctor: 'Dr. Ricardo Gálvez', especialidad: 'Odontología', paciente: 'Nicolás Herrera', disponibilidad: ['12:00 PM', '5:30 PM'] },

    // Psiquiatría
    { doctor: 'Dra. Mónica Fuentes', especialidad: 'Psiquiatría', paciente: 'Santiago León', disponibilidad: ['9:00 AM', '11:00 AM', '3:00 PM'] },
    { doctor: 'Dr. Alberto Castillo', especialidad: 'Psiquiatría', paciente: 'Isabel Moreno', disponibilidad: ['10:30 AM', '1:30 PM'] },
    { doctor: 'Dra. Claudia Rivas', especialidad: 'Psiquiatría', paciente: 'Fernando Salinas', disponibilidad: ['8:15 AM', '2:45 PM'] },
    { doctor: 'Dr. Gustavo Ponce', especialidad: 'Psiquiatría', paciente: 'Lorena Vega', disponibilidad: ['12:00 PM', '4:30 PM'] }
  ];

  constructor(private route: ActivatedRoute) { }


  selectedEspecialidad: string | null = null;
  busqueda: any[] = [];

  terminoDoctor: string = '';
  terminoEspecialidad: string = '';

  get citasFiltradas() {
    let data = [...this.citas];

    // 🔍 Filtrar por nombre de doctor
    if (this.terminoDoctor) {
      const term = this.terminoDoctor.toLowerCase();
      data = data.filter(c => c.doctor.toLowerCase().includes(term));
    }

    // 🏥 Filtrar por especialidad buscada
    if (this.terminoEspecialidad) {
      const termEsp = this.terminoEspecialidad.toLowerCase();
      data = data.filter(c => c.especialidad.toLowerCase().includes(termEsp));
    }

    // 📌 Filtrar si viene por URL (ej: /citas/cardiologia)
    if (this.selectedEspecialidad) {
      data = data.filter(c => c.especialidad.toLowerCase() === this.selectedEspecialidad);
    }

    return data;
  }

  seleccionarEspecialidad(especialidad: string | null) {
    this.selectedEspecialidad = especialidad;
  }

  onBuscarResultados(resultados: any[]) {
    this.busqueda = resultados.map(r => ({
      ...r,
      doctor: r.doctor.trim().toLowerCase(),
      especialidad: r.especialidad.trim().toLowerCase(),
      paciente: r.paciente.trim().toLowerCase()
    }));
  }

  seleccionarHorario(cita: any, horario: string) {
    alert(`Seleccionaste a ${cita.doctor} en ${horario}`);
  }
}
