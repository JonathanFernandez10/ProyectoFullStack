import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrdenCompra } from '../../shared/interfaces/orden-compra.interface';

@Injectable({ providedIn: 'root' })
export class OrdenCompraService {
    private apiUrl = `${environment.apiUrl}/ordenes-compra`;

    constructor(private http: HttpClient) { }

    getOrdenes(): Observable<{ ok: boolean; ordenes: OrdenCompra[] }> {
        return this.http.get<{ ok: boolean; ordenes: OrdenCompra[] }>(this.apiUrl);
    }

    crearOrden(orden: OrdenCompra): Observable<{ ok: boolean; orden: OrdenCompra }> {
        return this.http.post<{ ok: boolean; orden: OrdenCompra }>(this.apiUrl, orden);
    }

    actualizarOrden(id: string, orden: Partial<OrdenCompra>): Observable<{ ok: boolean; orden: OrdenCompra }> {
        return this.http.put<{ ok: boolean; orden: OrdenCompra }>(`${this.apiUrl}/${id}`, orden);
    }

    eliminarOrden(id: string): Observable<{ ok: boolean; mensaje: string }> {
        return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
    }
}