import { Component, Input, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/services/auth/user.service';

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './account-menu.component.html',
  styleUrl: './account-menu.component.css'
})
export class AccountMenuComponent {
  @Input() links: any[] = [];
  @Input() accountLinks: any[] = [];
  @Input() menuItems: any[] = [];
  @Input() mobile: boolean = false;
  public authService = inject(AuthService);
  public userAuthService = inject(UserService);
}