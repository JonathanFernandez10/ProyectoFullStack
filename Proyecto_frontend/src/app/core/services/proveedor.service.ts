import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Proveedor } from '../../shared/interfaces/proveedor.interface';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
    private apiUrl = `${environment.apiUrl}/proveedores`;

    constructor(private http: HttpClient) { }

    getProveedores(): Observable<{ ok: boolean; proveedores: Proveedor[] }> {
        return this.http.get<{ ok: boolean; proveedores: Proveedor[] }>(this.apiUrl);
    }

    crearProveedor(proveedor: Proveedor): Observable<{ ok: boolean; proveedor: Proveedor }> {
        return this.http.post<{ ok: boolean; proveedor: Proveedor }>(this.apiUrl, proveedor);
    }

    actualizarProveedor(id: string, proveedor: Proveedor): Observable<{ ok: boolean; proveedor: Proveedor }> {
        return this.http.put<{ ok: boolean; proveedor: Proveedor }>(`${this.apiUrl}/${id}`, proveedor);
    }

    eliminarProveedor(id: string): Observable<{ ok: boolean; mensaje: string }> {
        return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
    }
}