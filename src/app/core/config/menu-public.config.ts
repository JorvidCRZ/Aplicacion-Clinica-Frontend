import { MenuItem } from '../models/common/menu-items';

export const MENU_PUBLIC: MenuItem[] = [
    { label: 'Inicio', route: '/inicio', exact: true },
    { label: 'Especialidades', route: '/especialidades' },
    { label: 'Nosotros', route: '/nosotros' },
    { label: 'Citas', route: '/citas' },
    { label: 'Blog/Noticias', route: '/blog' },
    { label: 'Contacto', route: '/contacto' }
];
