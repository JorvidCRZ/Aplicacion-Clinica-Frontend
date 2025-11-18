import { MenuItem } from '../models/common/menu-items';

export const MENU_DASHBOARD: Record<string, MenuItem[]> = {
    admin: [
        { label: 'Panel de Control', route: '/admin/panel', icon: 'fa fa-tachometer-alt' },
        { label: 'Perfil', route: '/admin/info', icon: 'fa fa-user' },
        { label: 'Gestión Admins', route: '/admin/gestion-admins', icon: 'fa fa-user-shield' },
        { label: 'Gestión Citas', route: '/admin/gestion-citas', icon: 'fa fa-calendar' },
        { label: 'Gestión Médicos', route: '/admin/gestion-medicos', icon: 'fa fa-user-md' },
        { label: 'Gestión Pacientes', route: '/admin/gestion-pacientes', icon: 'fa fa-users' },
        { label: 'Gestión Usuarios', route: '/admin/gestion-usuarios', icon: 'fa fa-user-cog' },
        { label: 'Reportes', route: '/admin/reportes', icon: 'fa fa-chart-line' }
    ],
    medico: [
        { label: 'Resumen', route: '/medico/resumen', icon: 'fa fa-tachometer-alt' },
        { label: 'Mi Perfil', route: '/medico/mi-perfil', icon: 'fa fa-user' },
        { label: 'Citas', route: '/medico/citas', icon: 'fa fa-calendar' },
        { label: 'Reporte Personal', route: '/medico/reporte-personal', icon: 'fa fa-file-alt' },
        { label: 'Horarios', route: '/medico/horarios', icon: 'fa fa-clock' },
        { label: 'Pacientes', route: '/medico/pacientes', icon: 'fa fa-users' }
    ],
    paciente: [
        { label: 'Resumen', route: '/paciente/mi-resumen', icon: 'fa fa-tachometer-alt' },
        { label: 'Mi Perfil', route: '/paciente/mi-perfil', icon: 'fa fa-user-cog' },
        { label: 'Mis Citas', route: '/paciente/mis-citas', icon: 'fa fa-calendar' },
        { label: 'Historial Médico', route: '/paciente/historial-medico', icon: 'fa fa-notes-medical' },
        { label: 'Pagos', route: '/paciente/pagos', icon: 'fa fa-credit-card' }
    ]
};
