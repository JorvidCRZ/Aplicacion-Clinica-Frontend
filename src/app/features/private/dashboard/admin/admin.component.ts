import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/rol/auth.service';
import { MENU_DASHBOARD } from '../../../../core/config/menu-dasboard.config';
import { MenuItem } from '../../../../core/models/common/menu-items';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../public/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent
  ]
})

export class AdminComponent {
  currentUser: any;
  sidebarItems: MenuItem[] = [];

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.currentUser;
    const rol = this.currentUser?.rol ?? 'paciente';
    this.sidebarItems = MENU_DASHBOARD[rol];
  }

  cerrarSesion() {
    this.authService.logout();
  }
}
