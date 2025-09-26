import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Cita } from '../../../core/models/common/cita';

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
    nombreMascota: '',
    especie: '',
    raza: '',
    edad: '',
    servicioRequerido: '',
    fechaPreferida: '',
    horaPreferida: '',
    notasAdicionales: ''
  };

  servicios = [
    'Odontología',
    'Medicina felina',
    'Ecografías',
    'Cirugías',
    'Consultas médicas',
    'Internamientos',
    'Cardiología',
    'Emergencias',
    'Endoscopia',
    'Oftalmología',
    'Traumatología',
    'Oncología',
    'Nutrición',
    'Anestesia inhalatoria',
    'Laboratorio',
    'Baños y cortes'
  ];

  horas = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '03:00 PM',
    '04:00 PM'
  ];

  especies = ['Perro', 'Gato'];

  onSubmit() {
    console.log('Formulario enviado:', this.cita);
  }
}
