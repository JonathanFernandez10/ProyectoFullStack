import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { AuthService } from '../../core/services/auth.service';
import { Producto } from '../../shared/interfaces/producto.interface';
import { Categoria } from '../../shared/interfaces/categoria.interface';
import { Proveedor } from '../../shared/interfaces/proveedor.interface';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-productos',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, ConfirmDialogComponent],
    templateUrl: './productos.component.html'
})
export class ProductosComponent implements OnInit {
    productos: Producto[] = [];
    categorias: Categoria[] = [];
    proveedores: Proveedor[] = [];
    busqueda = '';
    filtroCategoria = '';            // '' = todas las categorías
    ordenarPor = 'nombre';           // columna activa para el orden
    ordenAsc = true;                 // true = ascendente, false = descendente
    cargando = false;
    error: string | null = null;
    errorModal: string | null = null;

    modalAbierto = false;
    editandoId: string | null = null;
    porEliminar: Producto | null = null;

    form: FormGroup;

    constructor(
        private productoService: ProductoService,
        private categoriaService: CategoriaService,
        private proveedorService: ProveedorService,
        private authService: AuthService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            nombre: ['', Validators.required],
            codigo: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{4}$/)]],
            descripcion: [''],
            categoria: ['', Validators.required],
            proveedor: ['', Validators.required],
            precio: [0, [Validators.required, Validators.min(0)]],
            stock: [0, [Validators.required, Validators.min(0)]],
            cantidadInicial: [0, [Validators.min(0)]]
        });
    }

    get puedeEscribir(): boolean {
        return this.authService.hasRole('admin', 'user');
    }

    get productosFiltrados(): Producto[] {
        const termino = this.busqueda.trim().toLowerCase();

        // 1. Filtrar por término de búsqueda y por categoría seleccionada.
        const filtrados = this.productos.filter(p => {
            const coincideTermino = !termino ||
                p.nombre.toLowerCase().includes(termino) ||
                p.codigo.toLowerCase().includes(termino);

            const coincideCategoria = !this.filtroCategoria ||
                this.idCategoria(p) === this.filtroCategoria;

            return coincideTermino && coincideCategoria;
        });

        // 2. Ordenar. Se usa una copia ([...]) para no alterar this.productos.
        const factor = this.ordenAsc ? 1 : -1;
        return [...filtrados].sort((a, b) => {
            let comparacion: number;
            switch (this.ordenarPor) {
                case 'precio':
                    comparacion = a.precio - b.precio;
                    break;
                case 'stock':
                    comparacion = a.stock - b.stock;
                    break;
                case 'codigo':
                    comparacion = a.codigo.localeCompare(b.codigo);
                    break;
                default:
                    comparacion = a.nombre.localeCompare(b.nombre);
            }
            return comparacion * factor;
        });
    }

    // Id de la categoría de un producto, venga como objeto poblado o como texto.
    private idCategoria(producto: Producto): string {
        return typeof producto.categoria === 'string' ? producto.categoria : producto.categoria._id;
    }

    // Cambia la columna de orden; si es la misma, invierte la dirección.
    ordenar(campo: string): void {
        if (this.ordenarPor === campo) {
            this.ordenAsc = !this.ordenAsc;
        } else {
            this.ordenarPor = campo;
            this.ordenAsc = true;
        }
    }

    ngOnInit(): void {
        this.cargar();
        this.categoriaService.getCategorias().subscribe(res => this.categorias = res.categorias);
        this.proveedorService.getProveedores().subscribe(res => this.proveedores = res.proveedores);
    }

    cargar(): void {
        this.cargando = true;
        this.productoService.getProductos().subscribe({
            next: (res) => {
                this.productos = res.productos;
                this.cargando = false;
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'Error al cargar productos';
                this.cargando = false;
            }
        });
    }

    nombreCategoria(producto: Producto): string {
        const c = producto.categoria;
        return typeof c === 'string' ? c : c?.nombre;
    }

    nombreProveedor(producto: Producto): string {
        const p = producto.proveedor;
        return typeof p === 'string' ? p : p?.nombre;
    }

    abrirNuevo(): void {
        this.editandoId = null;
        this.form.reset({ nombre: '', codigo: '', descripcion: '', categoria: '', proveedor: '', precio: 0, stock: 0, cantidadInicial: 0 });
        this.errorModal = null;
        this.modalAbierto = true;
    }

    abrirEditar(producto: Producto): void {
        this.editandoId = producto._id ?? null;
        const categoriaId = typeof producto.categoria === 'string' ? producto.categoria : producto.categoria._id;
        const proveedorId = typeof producto.proveedor === 'string' ? producto.proveedor : producto.proveedor._id;
        this.form.reset({
            nombre: producto.nombre,
            codigo: producto.codigo,
            descripcion: producto.descripcion || '',
            categoria: categoriaId,
            proveedor: proveedorId,
            precio: producto.precio,
            stock: producto.stock,
            cantidadInicial: 0
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

        const datos = { ...this.form.value };
        if (this.editandoId) {
            delete datos.cantidadInicial;
        }

        const request = this.editandoId
            ? this.productoService.actualizarProducto(this.editandoId, datos)
            : this.productoService.crearProducto(datos);

        request.subscribe({
            next: () => {
                this.cerrarModal();
                this.cargar();
            },
            error: (err) => {
                this.errorModal = err.error?.mensaje || 'Error al guardar el producto';
            }
        });
    }

    pedirEliminar(producto: Producto): void {
        this.porEliminar = producto;
    }

    confirmarEliminar(): void {
        if (!this.porEliminar?._id) return;
        this.productoService.eliminarProducto(this.porEliminar._id).subscribe({
            next: () => {
                this.porEliminar = null;
                this.cargar();
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'No se pudo eliminar el producto';
                this.porEliminar = null;
            }
        });
    }
}
