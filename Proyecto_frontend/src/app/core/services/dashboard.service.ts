import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AlertaStockBajo {
    producto: string;
    codigo: string;
    cantidadDisponible: number;
    stockMinimo: number;
}

export interface ResumenDashboard {
    totalProductos: number;
    totalProveedores: number;
    ordenesPendientes: number;
    alertasStockBajo: AlertaStockBajo[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) { }

    getResumen(): Observable<{ ok: boolean; resumen: ResumenDashboard }> {
        return this.http.get<{ ok: boolean; resumen: ResumenDashboard }>(`${this.apiUrl}/resumen`);
    }
}
