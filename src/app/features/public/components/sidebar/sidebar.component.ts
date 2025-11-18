import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '../../../../core/models/common/menu-items';
import { UserService } from '../../../../core/services/auth/user.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() title: string = 'Navegación';
  @Input() currentUser: any = null;

  public authService = inject(AuthService);
  public userAuthService = inject(UserService);

  ngOnInit(): void {
    if (!this.currentUser) {
      this.currentUser = this.authService.currentUser;
    }
    if (!this.menuItems || this.menuItems.length === 0) {
      this.menuItems = this.authService.getAccountLinks();
    }
  }
}
