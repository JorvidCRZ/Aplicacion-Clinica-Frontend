import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation, NavigationSkipped, RouterModule } from '@angular/router';
import { Card } from '../../../../core/models/utils/card';
import { CardGalleryComponent } from '../../../../shared/components/card-gallery/card-gallery.component';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/auth/user.service';
import { AuthNavigationService } from '../../../../core/services/auth/navigation.service';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, RouterModule, CardGalleryComponent],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.css'
})
export class ServiciosComponent {
  title = 'Nuestros Servicios';

  servicios: Card[] = [
    { id: 1, title: 'Odontologia', description: 'Ofrecemos paquetes odontologicos con expertos para cada caso en particular.', image: 'assets/galeria/servicios/servicio1.webp' },
    { id: 2, title: 'Medicina Felina', description: 'Atencion especializada con doctores especialistas ,diagnosticos precisos y cuidados personalizados.', image: 'assets/galeria/servicios/servicio2.webp' },
    { id: 3, title: 'Ecografias', description: 'Contamos con tecnologia avanzada,diagnosticos precisos y sin necesidad de sedacion.', image: 'assets/galeria/servicios/servicio3.webp' },
    { id: 4, title: 'Cirugias', description: 'Contamos con quirofano equipado,cirujanos expertos e instrumental esterilizada previa cirugia.', image: 'assets/galeria/servicios/servicio4.webp' },
    { id: 5, title: 'Consultas Medicas', description: 'Ofrecemos consultas medicas con especialistas,atencion personalizada y diagnostico preciso.', image: 'assets/galeria/servicios/servicio5.webp' },
    { id: 6, title: 'Internamientos', description: '24 hrs,con medicos veterinarios certificados y cuidados especializados.', image: 'assets/galeria/servicios/servicio6.webp' },
    { id: 7, title: 'Cardiologia', description: 'Diagnostico y tratamiento de enfermedades cardiacas para una salud optima de tu mascota.', image: 'assets/galeria/servicios/servicio7.webp' },
    { id: 8, title: 'Emergencias', description: 'Atencion inmediata y especializada para emergencias ,disponible las 24 horas del dia.', image: 'assets/galeria/servicios/servicio8.webp' },
    { id: 9, title: 'Endoscopia', description: 'EProcedimientos minimamente invasivos para diagnosticos precisos,sin necesidadde cirugias.', image: 'assets/galeria/servicios/servicio9.webp' },
    { id: 10, title: 'Oftalmologia', description: 'Diagnostico y tratamiento de enfermedades oculares para preservar la vision de tu mascota.', image: 'assets/galeria/servicios/servicio10.webp' },
    { id: 11, title: 'Traumatologia', description: 'Diagnostico,tratamiento y rehabilitacion de lesiones traumatologicas para tu mascota.', image: 'assets/galeria/servicios/servicio11.webp' },
    { id: 12, title: 'Oncologia', description: 'Prevencion ,diagnostico y tratamiento integral del cancer en mascotas.', image: 'assets/galeria/servicios/servicio12.webp' },
    { id: 13, title: 'Nutricion', description: 'Planes nutricionales personalizados para mejorar la salud y el bienestar de tu mascota.', image: 'assets/galeria/servicios/servicio13.webp' },
    { id: 14, title: 'Anestecia Inhalatoria', description: 'Anestecia segura y controlada para procedimientos quirurgicos ,minimizando riesgos y complicaciones.', image: 'assets/galeria/servicios/servicio14.webp' },
    { id: 15, title: 'Laboratorio', description: 'Pruebas diagnosticos rapidas y precisas para un tratamiento mas efectivo y peronalizado.', image: 'assets/galeria/servicios/servicio15.webp' },
    { id: 16, title: 'Baños y Cortes', description: 'Contamos con especialistas en cortes a maquina y tijera, shamputerapia', image: 'assets/galeria/servicios/servicio16.webp' }
  ];

  constructor(
    private navigationAuthService: AuthNavigationService,
    private router: Router
  ) { }

  agendarCita(): void {
    if (this.navigationAuthService.requireAuth('/servicio-formulario')) {
      this.router.navigate(['/servicio-formulario']);
    }
  }
}
