import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../../shared/interfaces/usuario.interface';

export const roleGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const rolesPermitidos = (route.data['roles'] as Rol[] | undefined) ?? [];

    if (rolesPermitidos.length === 0 || authService.hasRole(...rolesPermitidos)) {
        return true;
    }

    const usuario = authService.getUser();
    router.navigate([usuario ? authService.landingRouteForRole(usuario.rol) : '/login']);
    return false;
};
