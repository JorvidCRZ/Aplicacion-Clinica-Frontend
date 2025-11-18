import { Routes } from '@angular/router';
import { InicioComponent } from './features/public/pages/inicio/inicio.component';
import { EspecialidadesComponent } from './features/public/pages/especialidades/especialidades.component';
import { NosotrosComponent } from './features/public/pages/nosotros/nosotros.component';
import { CitasComponent } from './features/public/pages/citas/citas.component';
import { BlogComponent } from './features/public/pages/blog/blog.component';
import { ContactoComponent } from './features/public/pages/contacto/contacto.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { CheckoutComponent } from './features/private/checkout/checkout.component';
import { ServicioFormularioComponent } from './features/public/components/servicio-formulario/servicio-formulario.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { PacienteComponent } from './features/private/dashboard/paciente/paciente.component';
import { AdminComponent } from './features/private/dashboard/admin/admin.component';
import { ErrorComponent } from './shared/components/error/error.component';
import { MedicoComponent } from './features/private/dashboard/medico/medico.component';

export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: InicioComponent },
    { path: 'especialidades', component: EspecialidadesComponent },
    { path: 'especialidadportada/:idEspecialidad', loadComponent: () => import('./features/public/pages/especialidadportada/especialidadportada.component').then(m => m.Especialidadportada) },
    { path: 'nosotros', component: NosotrosComponent },
    { path: 'citas', component: CitasComponent },
    { path: 'citas/:idEspecialidad', component: CitasComponent },
    { path: 'blog', component: BlogComponent },
    { path: 'contacto', component: ContactoComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'checkout', component: CheckoutComponent },
    {
        path: 'recuperar',
        loadComponent: () => import('./features/auth/recuperar/recuperar.component').then(m => m.RecuperarComponent)
    },
    { path: 'servicio-formulario', component: ServicioFormularioComponent, canActivate: [AuthGuard] },

    {
        path: 'paciente',
        component: PacienteComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Paciente'] },
        children: [
            { path: '', redirectTo: 'mi-resumen', pathMatch: 'full' },
            { path: 'mi-resumen', loadComponent: () => import('./features/private/dashboard/paciente/mi-resumen/mi-resumen.component').then(m => m.MiResumenComponent) },
            { path: 'mi-perfil', loadComponent: () => import('./features/private/dashboard/paciente/mi-perfil/mi-perfil.component').then(m => m.MiPerfilComponent) },
            { path: 'mis-citas', loadComponent: () => import('./features/private/dashboard/paciente/mis-citas/mis-citas.component').then(m => m.MisCitasComponent) },
            { path: 'pagos', loadComponent: () => import('./features/private/dashboard/paciente/pagos/pagos.component').then(m => m.PagosComponent) },
            { path: 'historial-medico', loadComponent: () => import('./features/private/dashboard/paciente/historial-medico/historial-medico.component').then(m => m.HistorialMedicoComponent) },
        ]
    },

    {
        path: 'medico',
        component: MedicoComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Medico'] },
        children: [
            { path: '', redirectTo: 'resumen', pathMatch: 'full' },
            { path: 'resumen', loadComponent: () => import('./features/private/dashboard/medico/resumen/resumen.component').then(m => m.ResumenComponent) },
            { path: 'mi-perfil', loadComponent: () => import('./features/private/dashboard/medico/perfil/perfil.component').then(m => m.PerfilComponent) },
            { path: 'citas', loadComponent: () => import('./features/private/dashboard/medico/citas/citas.component').then(m => m.CitasComponent) },
            { path: 'reporte-personal', loadComponent: () => import('./features/private/dashboard/medico/reporte-personal/reporte-personal.component').then(m => m.ReportePersonalComponent) },
            { path: 'horarios', loadComponent: () => import('./features/private/dashboard/medico/horarios/horarios.component').then(m => m.HorariosComponent) },
            { path: 'pacientes', loadComponent: () => import('./features/private/dashboard/medico/pacientes/pacientes.component').then(m => m.PacientesComponent) },
        ]
    },

    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Administrador'] },
        children: [
            { path: '', redirectTo: 'panel', pathMatch: 'full' },
            { path: 'panel', loadComponent: () => import('./features/private/dashboard/admin/panel/panel.component').then(m => m.PanelComponent) },
            { path: 'info', loadComponent: () => import('./features/private/dashboard/admin/info/info.component').then(m => m.InfoComponent) },
            { path: 'gestion-admins', loadComponent: () => import('./features/private/dashboard/admin/gestion-admins/gestion-admins.component').then(m => m.GestionAdminsComponent) },
            { path: 'gestion-citas', loadComponent: () => import('./features/private/dashboard/admin/gestion-citas/gestion-citas.component').then(m => m.GestionCitasComponent) },
            { path: 'gestion-medicos', loadComponent: () => import('./features/private/dashboard/admin/gestion-medicos/gestion-medicos.component').then(m => m.GestionMedicosComponent) },
            { path: 'gestion-pacientes', loadComponent: () => import('./features/private/dashboard/admin/gestion-pacientes/gestion-pacientes.component').then(m => m.GestionPacientesComponent) },
            { path: 'gestion-usuarios', loadComponent: () => import('./features/private/dashboard/admin/gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent) },
            { path: 'reportes', loadComponent: () => import('./features/private/dashboard/admin/reportes/reportes.component').then(m => m.ReportesComponent) },
        ]
    },

    { path: 'configuracion', loadComponent: () => import('./core/config/configuration/configuration.component').then(m => m.ConfigurationComponent) },
    { path: '**', redirectTo: 'not-found' },
    { path: 'not-found', component: ErrorComponent },
];
