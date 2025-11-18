import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LogoComponent } from './logo/logo.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AccountMenuComponent } from './account-menu/account-menu.component';
import { MENU_PUBLIC } from '../../../core/config/menu-public.config';
import { MENU_DASHBOARD } from '../../../core/config/menu-dasboard.config';
import { UserService } from '../../../core/services/auth/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent, NavbarComponent, AccountMenuComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menuItems = MENU_PUBLIC;

  constructor(
    public authService: AuthService,
    public userAuthService: UserService
  ) { }

  get accountLinks() {
    return this.authService.getAccountLinks();
  }
}