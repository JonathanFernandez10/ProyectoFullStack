import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria } from '../../shared/interfaces/categoria.interface';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
    private apiUrl = `${environment.apiUrl}/categorias`;

    constructor(private http: HttpClient) { }

    getCategorias(): Observable<{ ok: boolean; categorias: Categoria[] }> {
        return this.http.get<{ ok: boolean; categorias: Categoria[] }>(this.apiUrl);
    }

    crearCategoria(categoria: Categoria): Observable<{ ok: boolean; categoria: Categoria }> {
        return this.http.post<{ ok: boolean; categoria: Categoria }>(this.apiUrl, categoria);
    }

    actualizarCategoria(id: string, categoria: Categoria): Observable<{ ok: boolean; categoria: Categoria }> {
        return this.http.put<{ ok: boolean; categoria: Categoria }>(`${this.apiUrl}/${id}`, categoria);
    }

    eliminarCategoria(id: string): Observable<{ ok: boolean; mensaje: string }> {
        return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
    }
}
