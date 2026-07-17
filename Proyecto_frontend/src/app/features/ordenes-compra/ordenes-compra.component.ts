import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { OrdenCompraService } from '../../core/services/orden-compra.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { ProductoService } from '../../core/services/producto.service';
import { AuthService } from '../../core/services/auth.service';
import { OrdenCompra, EstadoOrden } from '../../shared/interfaces/orden-compra.interface';
import { Proveedor } from '../../shared/interfaces/proveedor.interface';
import { Producto } from '../../shared/interfaces/producto.interface';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-ordenes-compra',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, ConfirmDialogComponent],
    templateUrl: './ordenes-compra.component.html'
})
export class OrdenesCompraComponent implements OnInit {
    ordenes: OrdenCompra[] = [];
    proveedores: Proveedor[] = [];
    productos: Producto[] = [];
    busqueda = '';
    cargando = false;
    error: string | null = null;
    errorModal: string | null = null;

    modalAbierto = false;
    porEliminar: OrdenCompra | null = null;

    estados: EstadoOrden[] = ['pendiente', 'aprobada', 'recibida', 'cancelada'];

    form: FormGroup;

    constructor(
        private ordenService: OrdenCompraService,
        private proveedorService: ProveedorService,
        private productoService: ProductoService,
        private authService: AuthService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            proveedor: ['', Validators.required],
            producto: ['', Validators.required],
            cantidad: [1, [Validators.required, Validators.min(1)]]
        });
    }

    get puedeGestionar(): boolean {
        return this.authService.hasRole('admin', 'user');
    }

    get titulo(): string {
        return this.puedeGestionar ? 'Órdenes de Compra' : 'Mis Órdenes de Compra';
    }

    get ordenesFiltradas(): OrdenCompra[] {
        const termino = this.busqueda.trim().toLowerCase();
        if (!termino) return this.ordenes;
        return this.ordenes.filter(o => {
            const prov = typeof o.proveedor === 'string' ? null : o.proveedor;
            const prod = typeof o.producto === 'string' ? null : o.producto;
            return prov?.nombre.toLowerCase().includes(termino) || prod?.nombre.toLowerCase().includes(termino);
        });
    }

    ngOnInit(): void {
        this.cargar();
        if (this.puedeGestionar) {
            this.proveedorService.getProveedores().subscribe(res => this.proveedores = res.proveedores);
            this.productoService.getProductos().subscribe(res => this.productos = res.productos);
        }
    }

    cargar(): void {
        this.cargando = true;
        this.ordenService.getOrdenes().subscribe({
            next: (res) => {
                this.ordenes = res.ordenes;
                this.cargando = false;
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'Error al cargar órdenes de compra';
                this.cargando = false;
            }
        });
    }

    nombreProveedor(o: OrdenCompra): string {
        return typeof o.proveedor === 'string' ? o.proveedor : o.proveedor.nombre;
    }

    nombreProducto(o: OrdenCompra): string {
        return typeof o.producto === 'string' ? o.producto : o.producto.nombre;
    }

    abrirNuevo(): void {
        this.form.reset({ proveedor: '', producto: '', cantidad: 1 });
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

        this.ordenService.crearOrden(this.form.value).subscribe({
            next: () => {
                this.cerrarModal();
                this.cargar();
            },
            error: (err) => {
                this.errorModal = err.error?.mensaje || 'Error al crear la orden de compra';
            }
        });
    }

    cambiarEstado(orden: OrdenCompra, estado: EstadoOrden): void {
        if (!orden._id) return;
        this.ordenService.actualizarOrden(orden._id, { estado }).subscribe({
            next: () => this.cargar(),
            error: (err) => {
                this.error = err.error?.mensaje || 'No se pudo actualizar el estado';
            }
        });
    }

    pedirEliminar(orden: OrdenCompra): void {
        this.porEliminar = orden;
    }

    confirmarEliminar(): void {
        if (!this.porEliminar?._id) return;
        this.ordenService.eliminarOrden(this.porEliminar._id).subscribe({
            next: () => {
                this.porEliminar = null;
                this.cargar();
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'No se pudo eliminar la orden';
                this.porEliminar = null;
            }
        });
    }
}
