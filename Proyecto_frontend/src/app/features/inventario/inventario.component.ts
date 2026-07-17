import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InventarioService } from '../../core/services/inventario.service';
import { AuthService } from '../../core/services/auth.service';
import { Inventario } from '../../shared/interfaces/inventario.interface';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
    selector: 'app-inventario',
    imports: [CommonModule, FormsModule, ModalComponent],
    templateUrl: './inventario.component.html'
})
export class InventarioComponent implements OnInit {
    inventario: Inventario[] = [];
    busqueda = '';
    cargando = false;
    error: string | null = null;
    errorModal: string | null = null;

    editando: Inventario | null = null;
    nuevaUbicacion = '';

    constructor(private inventarioService: InventarioService, private authService: AuthService) { }

    get puedeEscribir(): boolean {
        return this.authService.hasRole('admin', 'user');
    }

    get inventarioFiltrado(): Inventario[] {
        const termino = this.busqueda.trim().toLowerCase();
        if (!termino) return this.inventario;
        return this.inventario.filter(item => {
            const p = typeof item.producto === 'string' ? null : item.producto;
            return p?.nombre.toLowerCase().includes(termino) ||
                p?.codigo.toLowerCase().includes(termino) ||
                item.ubicacion.toLowerCase().includes(termino);
        });
    }

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        this.cargando = true;
        this.inventarioService.getInventario().subscribe({
            next: (res) => {
                this.inventario = res.inventario;
                this.cargando = false;
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'Error al cargar el inventario';
                this.cargando = false;
            }
        });
    }

    nombreProducto(item: Inventario): string {
        return typeof item.producto === 'string' ? item.producto : item.producto.nombre;
    }

    codigoProducto(item: Inventario): string {
        return typeof item.producto === 'string' ? '' : item.producto.codigo;
    }

    esStockBajo(item: Inventario): boolean {
        const p = typeof item.producto === 'string' ? null : item.producto;
        return !!p && item.cantidadDisponible <= p.stock;
    }

    abrirEditar(item: Inventario): void {
        this.errorModal = null;
        this.editando = item;
        this.nuevaUbicacion = item.ubicacion;
    }

    cerrarModal(): void {
        this.editando = null;
    }

    guardarUbicacion(): void {
        if (!this.editando?._id) return;
        this.inventarioService.actualizarUbicacion(this.editando._id, this.nuevaUbicacion).subscribe({
            next: () => {
                this.cerrarModal();
                this.cargar();
            },
            error: (err) => {
                this.errorModal = err.error?.mensaje || 'No se pudo actualizar la ubicación';
            }
        });
    }
}
