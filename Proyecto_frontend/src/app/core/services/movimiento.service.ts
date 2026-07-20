import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movimiento } from '../../shared/interfaces/movimiento.interface';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
    private apiUrl = `${environment.apiUrl}/movimientos`;

    constructor(private http: HttpClient) { }

    getMovimientos(): Observable<{ ok: boolean; movimientos: Movimiento[] }> {
        return this.http.get<{ ok: boolean; movimientos: Movimiento[] }>(this.apiUrl);
    }

    crearMovimiento(movimiento: Movimiento): Observable<{ ok: boolean; movimiento: Movimiento }> {
        return this.http.post<{ ok: boolean; movimiento: Movimiento }>(this.apiUrl, movimiento);
    }

    actualizarMovimiento(id: string, movimiento: Movimiento): Observable<{ ok: boolean; movimiento: Movimiento }> {
        return this.http.put<{ ok: boolean; movimiento: Movimiento }>(`${this.apiUrl}/${id}`, movimiento);
    }

    eliminarMovimiento(id: string): Observable<{ ok: boolean; mensaje: string }> {
        return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
    }
}