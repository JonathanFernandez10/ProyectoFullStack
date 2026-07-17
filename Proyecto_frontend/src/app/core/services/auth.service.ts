import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, RefreshResponse } from '../../shared/interfaces/auth-response.interface';
import { Rol, Usuario } from '../../shared/interfaces/usuario.interface';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password });
    }

    saveSession(response: AuthResponse): void {
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.usuario));
    }

    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    getUser(): Usuario | null {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    }

    /*
        Cierra la sesión: notifica al backend (que invalida el refresh token
        almacenado) y limpia el estado local. El error del POST se ignora:
        la sesión local se cierra de todas formas.
    */
    logout(): void {
        if (this.getAccessToken()) {
            this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
                next: () => { },
                error: () => { }
            });
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    isAuthenticated(): boolean {
        return this.getAccessToken() !== null;
    }

    hasRole(...roles: Rol[]): boolean {
        const user = this.getUser();
        return !!user && roles.includes(user.rol);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    refreshAccessToken(): Observable<RefreshResponse> {
        return this.http.post<RefreshResponse>(`${this.apiUrl}/auth/refresh-token`, {
            refreshToken: this.getRefreshToken()
        });
    }

    updateAccessToken(accessToken: string): void {
        localStorage.setItem('accessToken', accessToken);
    }

    /*
        Ruta de aterrizaje por defecto tras el login, según el rol del usuario.
    */
    landingRouteForRole(rol: Rol): string {
        switch (rol) {
            case 'guest':
                return '/productos';
            case 'proveedor':
                return '/mis-ordenes';
            default:
                return '/dashboard';
        }
    }
}
