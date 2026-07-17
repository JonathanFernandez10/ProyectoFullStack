import { Usuario } from './usuario.interface';

export interface AuthResponse {
    ok: boolean;
    usuario: Usuario;
    token: string;
    refreshToken: string;
}

export interface RefreshResponse {
    ok: boolean;
    accessToken: string;
}
