import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto } from '../../shared/interfaces/producto.interface';

interface ProductosResponse {
    ok: boolean;
    productos: Producto[];
}

interface ProductoResponse {
    ok: boolean;
    producto: Producto;
}

@Injectable({
    providedIn: 'root'
})
export class ProductoService {
    private apiUrl = `${environment.apiUrl}/productos`;

    constructor(private http: HttpClient) { }

    getProductos(): Observable<ProductosResponse> {
        return this.http.get<ProductosResponse>(this.apiUrl);
    }

    crearProducto(producto: Producto): Observable<ProductoResponse> {
        return this.http.post<ProductoResponse>(this.apiUrl, producto);
    }

    actualizarProducto(id: string, producto: Producto): Observable<ProductoResponse> {
        return this.http.put<ProductoResponse>(`${this.apiUrl}/${id}`, producto);
    }

    eliminarProducto(id: string): Observable<{ ok: boolean; mensaje: string }> {
        return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
    }
}
