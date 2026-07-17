import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Rol } from '../../shared/interfaces/usuario.interface';
import { LogoComponent } from '../../shared/components/logo/logo.component';

interface NavItem {
    label: string;
    path: string;
    icon: string;
    roles: Rol[];
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z', roles: ['admin', 'user'] },
    { label: 'Productos', path: '/productos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', roles: ['admin', 'user', 'guest'] },
    { label: 'Categorías', path: '/categorias', icon: 'M4 6h16M4 12h16M4 18h7', roles: ['admin', 'user', 'guest'] },
    { label: 'Proveedores', path: '/proveedores', icon: 'M3 7h18M3 12h18M3 17h18', roles: ['admin', 'user'] },
    { label: 'Inventario', path: '/inventario', icon: 'M20 12H4m16 0l-4-4m4 4l-4 4M4 12l4-4m-4 4l4 4', roles: ['admin', 'user', 'guest'] },
    { label: 'Movimientos', path: '/movimientos', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4', roles: ['admin', 'user'] },
    { label: 'Órdenes de Compra', path: '/ordenes-compra', icon: 'M9 5h6M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 0a2 2 0 002 2h2a2 2 0 002-2M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2', roles: ['admin', 'user'] },
    { label: 'Mis Órdenes', path: '/mis-ordenes', icon: 'M9 5h6M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 0a2 2 0 002 2h2a2 2 0 002-2M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2', roles: ['proveedor'] },
    { label: 'Usuarios', path: '/usuarios', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', roles: ['admin'] }
];

@Component({
    selector: 'app-shell',
    imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LogoComponent],
    templateUrl: './shell.component.html',
})
export class ShellComponent {
    sidebarAbierto = false;

    constructor(private authService: AuthService, private router: Router) { }

    get usuario() {
        return this.authService.getUser();
    }

    get navItems(): NavItem[] {
        const rol = this.usuario?.rol;
        if (!rol) return [];
        return NAV_ITEMS.filter(item => item.roles.includes(rol));
    }

    toggleSidebar(): void {
        this.sidebarAbierto = !this.sidebarAbierto;
    }

    cerrarSidebar(): void {
        this.sidebarAbierto = false;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
