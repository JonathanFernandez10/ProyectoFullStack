import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProveedorService } from '../../core/services/proveedor.service';
import { OrdenCompraService } from '../../core/services/orden-compra.service';
import { AuthService } from '../../core/services/auth.service';
import { Proveedor } from '../../shared/interfaces/proveedor.interface';
import { OrdenCompra } from '../../shared/interfaces/orden-compra.interface';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-proveedores',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, ConfirmDialogComponent],
    templateUrl: './proveedores.component.html'
})
export class ProveedoresComponent implements OnInit {
    proveedores: Proveedor[] = [];
    busqueda = '';
    cargando = false;
    error: string | null = null;
    errorModal: string | null = null;

    modalAbierto = false;
    editandoId: string | null = null;
    porEliminar: Proveedor | null = null;

    // Detalle: proveedor seleccionado y las órdenes de compra que se le han hecho.
    detalle: Proveedor | null = null;
    ordenesDelProveedor: OrdenCompra[] = [];
    cargandoDetalle = false;

    form: FormGroup;

    constructor(
        private proveedorService: ProveedorService,
        private ordenService: OrdenCompraService,
        private authService: AuthService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            nombre: ['', Validators.required],
            contacto: [''],
            telefono: ['', Validators.required],
            correo: ['', [Validators.required, Validators.email]],
            direccion: ['']
        });
    }

    get puedeEscribir(): boolean {
        return this.authService.hasRole('admin', 'user');
    }

    get proveedoresFiltrados(): Proveedor[] {
        const termino = this.busqueda.trim().toLowerCase();
        if (!termino) return this.proveedores;
        return this.proveedores.filter(p =>
            p.nombre.toLowerCase().includes(termino) ||
            p.correo.toLowerCase().includes(termino) ||
            p.telefono.includes(termino)
        );
    }

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        this.cargando = true;
        this.proveedorService.getProveedores().subscribe({
            next: (res) => {
                this.proveedores = res.proveedores;
                this.cargando = false;
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'Error al cargar proveedores';
                this.cargando = false;
            }
        });
    }

    abrirNuevo(): void {
        this.editandoId = null;
        this.form.reset({ nombre: '', contacto: '', telefono: '', correo: '', direccion: '' });
        this.errorModal = null;
        this.modalAbierto = true;
    }

    abrirEditar(proveedor: Proveedor): void {
        this.editandoId = proveedor._id ?? null;
        this.form.setValue({
            nombre: proveedor.nombre,
            contacto: proveedor.contacto || '',
            telefono: proveedor.telefono,
            correo: proveedor.correo,
            direccion: proveedor.direccion || ''
        });
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

        const datos = this.form.value;
        const request = this.editandoId
            ? this.proveedorService.actualizarProveedor(this.editandoId, datos)
            : this.proveedorService.crearProveedor(datos);

        request.subscribe({
            next: () => {
                this.cerrarModal();
                this.cargar();
            },
            error: (err) => {
                this.errorModal = err.error?.mensaje || 'Error al guardar el proveedor';
            }
        });
    }
    
    // Abre el detalle del proveedor y carga sus órdenes de compra.
    verDetalle(proveedor: Proveedor): void {
        this.detalle = proveedor;
        this.ordenesDelProveedor = [];
        this.cargandoDetalle = true;

        this.ordenService.getOrdenes().subscribe({
            next: (res) => {
                this.ordenesDelProveedor = res.ordenes.filter(o => {
                    // El proveedor de la orden puede venir como objeto poblado o como id.
                    const idProv = typeof o.proveedor === 'string' ? o.proveedor : o.proveedor._id;
                    return idProv === proveedor._id;
                });
                this.cargandoDetalle = false;
            },
            error: () => {
                this.cargandoDetalle = false;
            }
        });
    }

    cerrarDetalle(): void {
        this.detalle = null;
    }

    nombreProductoOrden(orden: OrdenCompra): string {
        return typeof orden.producto === 'string' ? orden.producto : orden.producto.nombre;
    }
    pedirEliminar(proveedor: Proveedor): void {
        this.porEliminar = proveedor;
    }

    confirmarEliminar(): void {
        if (!this.porEliminar?._id) return;
        this.proveedorService.eliminarProveedor(this.porEliminar._id).subscribe({
            next: () => {
                this.porEliminar = null;
                this.cargar();
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'No se pudo eliminar el proveedor';
                this.porEliminar = null;
            }
        });
    }
}
