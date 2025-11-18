import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../public/components/sidebar/sidebar.component';
import { UserService } from '../../../../core/services/auth/user.service';
import { MENU_DASHBOARD } from '../../../../core/config/menu-dasboard.config';
import { MenuItem } from '../../../../core/models/common/menu-items';

@Component({
  selector: 'app-paciente',
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent
  ]
})
export class PacienteComponent {
  sidebarItems: MenuItem[] = [];

  constructor(
    public authService: AuthService,
    public userAuthService: UserService
  ) {
    this.sidebarItems = MENU_DASHBOARD['paciente'] || [];
  }
}
