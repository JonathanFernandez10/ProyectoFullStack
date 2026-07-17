import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductosComponent } from './features/productos/productos.component';
import { CategoriasComponent } from './features/categorias/categorias.component';
import { ProveedoresComponent } from './features/proveedores/proveedores.component';
import { InventarioComponent } from './features/inventario/inventario.component';
import { MovimientosComponent } from './features/movimientos/movimientos.component';
import { OrdenesCompraComponent } from './features/ordenes-compra/ordenes-compra.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        component: LandingComponent,
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        component: ShellComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard], data: { roles: ['admin', 'user'] } },
            { path: 'usuarios', component: UsuariosComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
            { path: 'productos', component: ProductosComponent, canActivate: [roleGuard], data: { roles: ['admin', 'user', 'guest'] } },
            { path: 'categorias', component: CategoriasComponent, canActivate: [roleGuard], data: { roles: ['admin', 'user', 'guest'] } },
            { path: 'proveedores', component: ProveedoresComponent, canActivate: [roleGuard], data: { roles: ['admin', 'user'] } },
            { path: 'inventario', component: InventarioComponent, canActivate: [roleGuard], data: { roles: ['admin', 'user', 'guest'] } },
            { path: 'movimientos', component: MovimientosComponent, canActivate: [roleGuard], data: { roles: ['admin', 'user'] } },
            { path: 'ordenes-compra', component: OrdenesCompraComponent, canActivate: [roleGuard], data: { roles: ['admin', 'user'] } },
            { path: 'mis-ordenes', component: OrdenesCompraComponent, canActivate: [roleGuard], data: { roles: ['proveedor'] } }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
