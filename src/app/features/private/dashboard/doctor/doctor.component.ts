import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { MENU_DASHBOARD } from '../../../../core/config/menu-dasboard.config';
import { MenuItem } from '../../../../core/models/common/menu-items';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../public/components/sidebar/sidebar.component';

@Component({
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent
  ]
})
export class DoctorComponent {
  currentUser: any;
  sidebarItems: MenuItem[] = [];

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.currentUser;
    const rol = this.currentUser?.rol ?? 'doctor';
    this.sidebarItems = MENU_DASHBOARD[rol];
  }

  cerrarSesion() {
    this.authService.logout();
  }
}
