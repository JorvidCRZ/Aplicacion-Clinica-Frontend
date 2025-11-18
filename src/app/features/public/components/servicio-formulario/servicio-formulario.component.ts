import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Cita } from '../../../../core/models/common/cita';

@Component({
  selector: 'app-servicio-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicio-formulario.component.html',
  styleUrl: './servicio-formulario.component.css'
})
export class ServicioFormularioComponent {
  cita: Cita = {
    nombreCompleto: '',
    telefono: '',
    email: '',
    cedula: '',
    fechaNacimiento: '',
    genero: '',
    direccion: '',
    especialidadRequerida: '',
    motivoConsulta: '',
    fechaPreferida: '',
    horaPreferida: '',
    notasAdicionales: ''
  };

  especialidades = [
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Pediatría',
    'Traumatología',
    'Odontología',
    'Psicología',
    'Anestesiología'
  ];

  generos = [
    'Masculino',
    'Femenino',
    'Otro'
  ];

  horas = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM'
  ];

  onSubmit() {
    console.log('Formulario enviado:', this.cita);
  }
}
