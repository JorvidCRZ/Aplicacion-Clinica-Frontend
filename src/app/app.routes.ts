import { Routes } from '@angular/router';
import { InicioComponent } from './features/public/pages/inicio/inicio.component';
import { NosotrosComponent } from './features/public/pages/nosotros/nosotros.component';
import { ServiciosComponent } from './features/public/pages/servicios/servicios.component';
import { ContactoComponent } from './features/public/pages/contacto/contacto.component';
import { LoginComponent } from './features/auth/login/login.component';
import { CarritoComponent } from './features/public/pages/carrito/carrito.component';
import { CheckoutComponent } from './features/private/checkout/checkout.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { ServicioFormularioComponent } from './shared/components/servicio-formulario/servicio-formulario.component';
import { UsuarioComponent } from './features/private/dashboard/cliente/usuario/usuario.component';
import { AdminComponent } from './features/private/dashboard/admin/admin.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ResumenComponent } from './features/private/dashboard/cliente/resumen/resumen.component';
import { PerfilComponent } from './features/private/dashboard/cliente/perfil/perfil.component';
import { MisCitasComponent } from './features/private/dashboard/cliente/mis-citas/mis-citas.component';
import { MisAdopcionesComponent } from './features/private/dashboard/cliente/mis-adopciones/mis-adopciones.component';
import { MisPedidosComponent } from './features/private/dashboard/cliente/mis-pedidos/mis-pedidos.component';
import { MisMascotasComponent } from './features/private/dashboard/cliente/mis-mascotas/mis-mascotas.component';
import { BlogComponent } from './features/public/pages/blog/blog.component';
import { CitasComponent } from './features/public/pages/citas/citas.component';
import { EspecialidadesComponent } from './features/public/pages/especialidades/especialidades.component';

export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: InicioComponent },
    { path: 'especialidades', component: EspecialidadesComponent },
    { path: 'servicios', component: ServiciosComponent },
    { path: 'nosotros', component: NosotrosComponent },
    { path: 'citas', component: CitasComponent },
    { path: 'citas/:idEspecialidad', component: CitasComponent },
    { path: 'blog', component: BlogComponent },
    { path: 'contacto', component: ContactoComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'carrito', component: CarritoComponent },
    { path: 'checkout', component: CheckoutComponent },
    { path: 'usuario', component: UsuarioComponent },
    { path: 'servicio-formulario', component: ServicioFormularioComponent, canActivate: [AuthGuard] },
    {
        path: 'usuario',
        component: UsuarioComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'resumen', pathMatch: 'full' },
            { path: 'resumen', component: ResumenComponent },
            { path: 'perfil', component: PerfilComponent },
            { path: 'mascotas', component: MisMascotasComponent },
            { path: 'citas', component: MisCitasComponent },
            { path: 'adopciones', component: MisAdopcionesComponent },
            { path: 'pedidos', component: MisPedidosComponent }
        ]
    },

    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'panel', pathMatch: 'full' },
            { path: 'panel', loadComponent: () => import('./features/private/dashboard/admin/panel/panel.component').then(m => m.PanelComponent) },
            { path: 'usuarios', loadComponent: () => import('./features/private/dashboard/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent) },
            { path: 'productos', loadComponent: () => import('./features/private/dashboard/admin/productos/productos.component').then(m => m.ProductosComponent) },
            { path: 'pedidos', loadComponent: () => import('./features/private/dashboard/admin/pedidos/pedidos.component').then(m => m.PedidosComponent) },
            { path: 'citas', loadComponent: () => import('./features/private/dashboard/admin/citas/citas.component').then(m => m.CitasComponent) }
        ]
    }
];
