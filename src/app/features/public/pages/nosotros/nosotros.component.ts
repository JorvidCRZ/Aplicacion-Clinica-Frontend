import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { sede } from '../../../../core/models/common/sedes';
import { SafeUrlPipe } from "../../../../shared/pipes/safeurl.pipe";

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css'
})

export class NosotrosComponent {
  urlMap = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.9936902610566!2d-76.9696045!3d-12.0439548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c7642c5fecb3%3A0x6f505fa5f117a0aa!2sCl%C3%ADnica%20Tu%20Salud%20-%20Santa%20Anita!5e0!3m2!1ses-419!2spe!4v1758596669186!5m2!1ses-419!2spe';
  URLSede = 'assets/sedes/sede-';
  sedes: sede[] = [
    { nombre: 'Sede Santa Anita', direccion: 'Av. Los Ruiseñores 988 Mz,', telefono: '984299900', correo: 'ClinicaTuSalud@support.com', imagen: `${this.URLSede}santa-anita.webp`, mapa: this.urlMap }
  ];
}
