import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { LogoComponent } from '../../shared/components/logo/logo.component';

@Component({
    selector: 'app-landing',
    imports: [CommonModule, RouterLink, LogoComponent],
    templateUrl: './landing.component.html'
})
export class LandingComponent {
    anioActual = new Date().getFullYear();

    valores = [
        {
            titulo: 'Trazabilidad',
            descripcion: 'Cada producto que entra o sale de nuestras bodegas queda registrado. Saber dónde está todo, siempre, es nuestra promesa.',
            icono: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
        },
        {
            titulo: 'Puntualidad',
            descripcion: 'Los despachos llegan cuando se prometen. Nuestra red de distribución cubre todo el país con tiempos de entrega garantizados.',
            icono: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            titulo: 'Transparencia',
            descripcion: 'Nuestros clientes y proveedores consultan en línea el estado real de sus órdenes e inventarios, sin intermediarios ni sorpresas.',
            icono: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
        }
    ];

    stats = [
        { valor: '25+', etiqueta: 'años de trayectoria' },
        { valor: '3', etiqueta: 'centros de distribución' },
        { valor: '400+', etiqueta: 'clientes activos' },
        { valor: '12k', etiqueta: 'despachos al año' }
    ];
}
