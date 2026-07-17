import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../shared/interfaces/usuario.interface';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
    private apiUrl = `${environment.apiUrl}/usuarios`;

    constructor(private http: HttpClient) { }

    getUsuarios(): Observable<{ ok: boolean; usuarios: Usuario[] }> {
        return this.http.get<{ ok: boolean; usuarios: Usuario[] }>(this.apiUrl);
    }

    crearUsuario(usuario: Usuario): Observable<{ ok: boolean; usuario: Usuario }> {
        return this.http.post<{ ok: boolean; usuario: Usuario }>(this.apiUrl, usuario);
    }

    actualizarUsuario(id: string, usuario: Partial<Usuario>): Observable<{ ok: boolean; usuario: Usuario }> {
        return this.http.put<{ ok: boolean; usuario: Usuario }>(`${this.apiUrl}/${id}`, usuario);
    }

    eliminarUsuario(id: string): Observable<{ ok: boolean; mensaje: string }> {
        return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
    }
}
