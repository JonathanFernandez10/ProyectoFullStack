import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inventario } from '../../shared/interfaces/inventario.interface';

@Injectable({ providedIn: 'root' })
export class InventarioService {
    private apiUrl = `${environment.apiUrl}/inventario`;

    constructor(private http: HttpClient) { }

    getInventario(): Observable<{ ok: boolean; inventario: Inventario[] }> {
        return this.http.get<{ ok: boolean; inventario: Inventario[] }>(this.apiUrl);
    }

    actualizarUbicacion(id: string, ubicacion: string): Observable<{ ok: boolean; inventario: Inventario }> {
        return this.http.put<{ ok: boolean; inventario: Inventario }>(`${this.apiUrl}/${id}`, { ubicacion });
    }
}
