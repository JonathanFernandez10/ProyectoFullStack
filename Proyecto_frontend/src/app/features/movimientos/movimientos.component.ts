import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MovimientoService } from '../../core/services/movimiento.service';
import { ProductoService } from '../../core/services/producto.service';
import { Movimiento } from '../../shared/interfaces/movimiento.interface';
import { Producto } from '../../shared/interfaces/producto.interface';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-movimientos',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, ConfirmDialogComponent],
    templateUrl: './movimientos.component.html'
})
export class MovimientosComponent implements OnInit {
    movimientos: Movimiento[] = [];
    productos: Producto[] = [];
    busqueda = '';
    filtroTipo = '';                 // '' = todos los tipos
    fechaDesde = '';                 // formato YYYY-MM-DD
    fechaHasta = '';
    cargando = false;
    error: string | null = null;
    errorModal: string | null = null;

    modalAbierto = false;
    porEliminar: Movimiento | null = null;

    tipos = ['entrada', 'salida', 'ajuste', 'devolucion'];

    form: FormGroup;

    constructor(
        private movimientoService: MovimientoService,
        private productoService: ProductoService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            producto: ['', Validators.required],
            tipoMovimiento: ['entrada', Validators.required],
            cantidad: [1, [Validators.required, Validators.min(0)]],
            notas: ['']
        });
    }

    get movimientosFiltrados(): Movimiento[] {
        const termino = this.busqueda.trim().toLowerCase();

        return this.movimientos.filter(m => {
            const p = typeof m.producto === 'string' ? null : m.producto;

            const coincideTermino = !termino ||
                !!p?.nombre.toLowerCase().includes(termino) ||
                !!p?.codigo.toLowerCase().includes(termino);

            const coincideTipo = !this.filtroTipo || m.tipoMovimiento === this.filtroTipo;

            // La fecha llega como texto ISO (2026-07-15T...); comparamos solo la parte
            // de la fecha (primeros 10 caracteres) para incluir el día completo del "hasta".
            const soloFecha = (m.fecha || '').substring(0, 10);
            const coincideDesde = !this.fechaDesde || soloFecha >= this.fechaDesde;
            const coincideHasta = !this.fechaHasta || soloFecha <= this.fechaHasta;

            return coincideTermino && coincideTipo && coincideDesde && coincideHasta;
        });
    }

    exportarCSV(): void {
        const encabezados = ['Producto', 'Codigo', 'Tipo', 'Cantidad', 'Usuario', 'Fecha'];

        const escapar = (valor: string) => `"${String(valor).replace(/"/g, '""')}"`;

        const filas = this.movimientosFiltrados.map(m => {
            const p = typeof m.producto === 'string' ? null : m.producto;
            return [
                this.nombreProducto(m),
                p?.codigo || '',
                m.tipoMovimiento,
                String(m.cantidad),
                this.nombreUsuario(m),
                (m.fecha || '').substring(0, 10)
            ].map(escapar).join(',');
        });

        // El BOM (﻿) hace que Excel abra los acentos correctamente.
        const contenido = '﻿' + [encabezados.map(escapar).join(','), ...filas].join('\r\n');

        const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'movimientos.csv';
        enlace.click();
        URL.revokeObjectURL(url);
    }


    ngOnInit(): void {
        this.cargar();
        this.productoService.getProductos().subscribe(res => this.productos = res.productos);
    }

    cargar(): void {
        this.cargando = true;
        this.movimientoService.getMovimientos().subscribe({
            next: (res) => {
                this.movimientos = res.movimientos;
                this.cargando = false;
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'Error al cargar movimientos';
                this.cargando = false;
            }
        });
    }

    nombreProducto(m: Movimiento): string {
        return typeof m.producto === 'string' ? m.producto : m.producto.nombre;
    }

    nombreUsuario(m: Movimiento): string {
        if (!m.usuario) return '—';
        return typeof m.usuario === 'string' ? m.usuario : m.usuario.nombre;
    }

    abrirNuevo(): void {
        this.form.reset({ producto: '', tipoMovimiento: 'entrada', cantidad: 1, notas: '' });
        this.errorModal = null;
        this.modalAbierto = true;
    }

    cerrarModal(): void {
        this.modalAbierto = false;
    }

    guardar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.errorModal = 'Completa los campos requeridos correctamente.';
            return;
        }

        this.movimientoService.crearMovimiento(this.form.value).subscribe({
            next: () => {
                this.cerrarModal();
                this.cargar();
            },
            error: (err) => {
                this.errorModal = err.error?.mensaje || err.error?.error || 'Error al registrar el movimiento';
            }
        });
    }

    pedirEliminar(movimiento: Movimiento): void {
        this.porEliminar = movimiento;
    }

    confirmarEliminar(): void {
        if (!this.porEliminar?._id) return;
        this.movimientoService.eliminarMovimiento(this.porEliminar._id).subscribe({
            next: () => {
                this.porEliminar = null;
                this.cargar();
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'No se pudo eliminar el movimiento';
                this.porEliminar = null;
            }
        });
    }
}
