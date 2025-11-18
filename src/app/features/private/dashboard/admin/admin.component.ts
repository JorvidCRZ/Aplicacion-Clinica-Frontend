import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../public/components/sidebar/sidebar.component';
import { UserService } from '../../../../core/services/auth/user.service';
import { MenuItem } from '../../../../core/models/common/menu-items';
import { MENU_DASHBOARD } from '../../../../core/config/menu-dasboard.config';

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
  sidebarItems: MenuItem[] = [];

  constructor(
    public authService: AuthService,
    public userAuthService: UserService
  ) {
    this.sidebarItems = MENU_DASHBOARD[userAuthService.getRoleDisplayName()];
  }
}
