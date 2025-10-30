import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../public/components/sidebar/sidebar.component';
import { MENU_DASHBOARD } from '../../../../core/config/menu-dasboard.config';
import { MenuItem } from '../../../../core/models/common/menu-items';
import { UserService } from '../../../../core/services/auth/user.service';

@Component({
  selector: 'app-medico',
  templateUrl: './medico.component.html',
  styleUrls: ['./medico.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent
  ]
})
export class MedicoComponent {
  sidebarItems: MenuItem[] = [];

  constructor(
    public authService: AuthService,
    public userAuthService: UserService
  ) {
    this.sidebarItems = MENU_DASHBOARD['medico'] || [];
  }
}
