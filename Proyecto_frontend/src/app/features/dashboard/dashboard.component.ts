import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { DashboardService, ResumenDashboard } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
    resumen: ResumenDashboard | null = null;
    cargando = true;
    error: string | null = null;

    constructor(private dashboardService: DashboardService, private authService: AuthService) { }

    get nombreUsuario(): string {
        return this.authService.getUser()?.nombre ?? '';
    }

    ngOnInit(): void {
        this.dashboardService.getResumen().subscribe({
            next: (res) => {
                this.resumen = res.resumen;
                this.cargando = false;
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'No se pudo cargar el resumen';
                this.cargando = false;
            }
        });
    }
}
