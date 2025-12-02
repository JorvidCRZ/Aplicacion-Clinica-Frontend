import { Component, OnInit, OnDestroy, inject } from '@angular/core'; // Agregamos inject
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Importamos Router
import { LogoComponent } from './logo/logo.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AccountMenuComponent } from './account-menu/account-menu.component';
import { MENU_PUBLIC } from '../../../core/config/menu-public.config';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserService } from '../../../core/services/auth/user.service';
import { NotificacionService } from '../../../core/services/logic/notificacion.service';
import { Notificacion } from '../../../core/models/common/notificacion';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent, NavbarComponent, AccountMenuComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuItems = MENU_PUBLIC;
  notificaciones: Notificacion[] = [];
  mostrarMenu: boolean = false;
  private pollingInterval: any;

  // Inyectamos el Router aquí
  constructor(
    public authService: AuthService,
    public userAuthService: UserService,
    private notificacionService: NotificacionService,
    private router: Router 
  ) { }

  ngOnInit(): void {
    this.cargarNotificaciones();
    this.pollingInterval = setInterval(() => {
      this.cargarNotificaciones();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  get accountLinks() {
    return this.authService.getAccountLinks();
  }

  cargarNotificaciones() {
    const authData = localStorage.getItem('auth'); 
    if (authData) {
      this.notificacionService.obtenerNoLeidas().subscribe({
        next: (data) => this.notificaciones = data,
        error: (err) => { }
      });
    }
  }

  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  marcarLeida(notificacion: Notificacion) {
 
    this.notificacionService.marcarComoLeida(notificacion.id).subscribe({
      next: () => {
    
        this.notificaciones = this.notificaciones.filter(n => n.id !== notificacion.id);
        this.mostrarMenu = false; 

     
    
        if (notificacion.tipo === 'SOLICITUD_HORARIO') {
            this.router.navigate(['/admin/solicitudes']);
        }

       
        if (notificacion.tipo === 'APROBACION_HORARIO' || notificacion.tipo === 'RECHAZO_HORARIO') {
            this.router.navigate(['/medico/horarios']);
        }
      },
      error: (err) => console.error('Error al marcar como leída', err)
    });
  }
}