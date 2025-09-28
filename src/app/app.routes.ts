import { Routes } from '@angular/router';
import { InicioComponent } from './features/public/pages/inicio/inicio.component';
import { EspecialidadesComponent } from './features/public/pages/especialidades/especialidades.component';
import { NosotrosComponent } from './features/public/pages/nosotros/nosotros.component';
import { CitasComponent } from './features/public/pages/citas/citas.component';
import { BlogComponent } from './features/public/pages/blog/blog.component';
import { ContactoComponent } from './features/public/pages/contacto/contacto.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { CarritoComponent } from './features/public/pages/carrito/carrito.component';
import { CheckoutComponent } from './features/private/checkout/checkout.component';
import { ServicioFormularioComponent } from './shared/components/servicio-formulario/servicio-formulario.component';
import { AuthGuard } from './core/guards/auth.guard';
import { PacienteComponent } from './features/private/dashboard/paciente/paciente.component';
import { MisCitasComponent } from './features/private/dashboard/paciente/mis-citas/mis-citas.component';
import { MiPerfilComponent } from './features/private/dashboard/paciente/mi-perfil/mi-perfil.component';
import { HistorialMedicoComponent } from './features/private/dashboard/paciente/historial-medico/historial-medico.component';
import { PagosComponent } from './features/private/dashboard/paciente/pagos/pagos.component';
import { DoctorComponent } from './features/private/dashboard/doctor/doctor.component';
import { PerfilComponent } from './features/private/dashboard/doctor/perfil/perfil.component';
import { ResumenComponent } from './features/private/dashboard/doctor/resumen/resumen.component';
import { ReportePersonalComponent } from './features/private/dashboard/doctor/reporte-personal/reporte-personal.component';
import { HorariosComponent } from './features/private/dashboard/doctor/horarios/horarios.component';
import { PacientesComponent } from './features/private/dashboard/doctor/pacientes/pacientes.component';
import { AdminComponent } from './features/private/dashboard/admin/admin.component';
// import { ServiciosComponent } from './features/public/pages/servicios/servicios.component';

export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: InicioComponent },
    { path: 'especialidades', component: EspecialidadesComponent },
    { path: 'nosotros', component: NosotrosComponent },
    { path: 'citas', component: CitasComponent },
    { path: 'citas/:idEspecialidad', component: CitasComponent },
    { path: 'blog', component: BlogComponent },
    { path: 'contacto', component: ContactoComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'carrito', component: CarritoComponent },
    { path: 'checkout', component: CheckoutComponent },
    // { path: 'servicios', component: ServiciosComponent },
    { path: 'servicio-formulario', component: ServicioFormularioComponent, canActivate: [AuthGuard] },

    {
        path: 'paciente',
        component: PacienteComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'miperfil', pathMatch: 'full' },
            { path: 'mi-perfil', component: MiPerfilComponent },
            { path: 'mis-citas', component: MisCitasComponent },
            { path: 'pagos', component: PagosComponent },
            { path: 'historial-medico', component: HistorialMedicoComponent },
        ]
    },
    {
        path: 'doctor',
        component: DoctorComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'resumen', pathMatch: 'full' },
            { path: 'resumen', component: ResumenComponent },
            { path: 'perfil', component: PerfilComponent },
            { path: 'citas', component: MisCitasComponent },
            { path: 'reporte-personal', component: ReportePersonalComponent },
            { path: 'horarios', component: HorariosComponent },
            { path: 'pacientes', component: PacientesComponent },
        ]
    },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'panel', pathMatch: 'full' },
            { path: 'panel', loadComponent: () => import('./features/private/dashboard/admin/panel/panel.component').then(m => m.PanelComponent) },
            { path: 'gestion-citas', loadComponent: () => import('./features/private/dashboard/admin/gestion-citas/gestion-citas.component').then(m => m.GestionCitasComponent) },
            { path: 'gestion-doctores', loadComponent: () => import('./features/private/dashboard/admin/gestion-doctores/gestion-doctores.component').then(m => m.GestionDoctoresComponent) },
            { path: 'gestion-pacientes', loadComponent: () => import('./features/private/dashboard/admin/gestion-pacientes/gestion-pacientes.component').then(m => m.GestionPacientesComponent) },
            { path: 'gestion-usuarios', loadComponent: () => import('./features/private/dashboard/admin/gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent) },
            { path: 'reportes', loadComponent: () => import('./features/private/dashboard/admin/reportes/reportes.component').then(m => m.ReportesComponent) },
        ]
    }
];
