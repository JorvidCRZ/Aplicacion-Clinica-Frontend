import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '../../../../core/models/common/menu-items';
import { AuthService } from '../../../../core/services/auth.service';

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

  constructor(private authService: AuthService) {}

  getUserIcon(): string {
    return this.authService.getUserIcon();
  }

  logout(): void {
    this.authService.logout();
  }
}