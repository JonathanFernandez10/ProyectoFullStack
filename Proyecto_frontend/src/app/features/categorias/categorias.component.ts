import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { CategoriaService } from '../../core/services/categoria.service';
import { AuthService } from '../../core/services/auth.service';
import { Categoria } from '../../shared/interfaces/categoria.interface';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-categorias',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, ConfirmDialogComponent],
    templateUrl: './categorias.component.html'
})
export class CategoriasComponent implements OnInit {
    categorias: Categoria[] = [];
    busqueda = '';
    cargando = false;
    error: string | null = null;
    errorModal: string | null = null;

    modalAbierto = false;
    editandoId: string | null = null;
    porEliminar: Categoria | null = null;

    form: FormGroup;

    constructor(
        private categoriaService: CategoriaService,
        private authService: AuthService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            nombre: ['', Validators.required],
            descripcion: ['']
        });
    }

    get puedeEscribir(): boolean {
        return this.authService.hasRole('admin', 'user');
    }

    get categoriasFiltradas(): Categoria[] {
        const termino = this.busqueda.trim().toLowerCase();
        if (!termino) return this.categorias;
        return this.categorias.filter(c =>
            c.nombre.toLowerCase().includes(termino) ||
            (c.descripcion || '').toLowerCase().includes(termino)
        );
    }

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        this.cargando = true;
        this.categoriaService.getCategorias().subscribe({
            next: (res) => {
                this.categorias = res.categorias;
                this.cargando = false;
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'Error al cargar categorías';
                this.cargando = false;
            }
        });
    }

    abrirNuevo(): void {
        this.editandoId = null;
        this.form.reset({ nombre: '', descripcion: '' });
        this.errorModal = null;
        this.modalAbierto = true;
    }

    abrirEditar(categoria: Categoria): void {
        this.editandoId = categoria._id ?? null;
        this.form.setValue({ nombre: categoria.nombre, descripcion: categoria.descripcion || '' });
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
            ? this.categoriaService.actualizarCategoria(this.editandoId, datos)
            : this.categoriaService.crearCategoria(datos);

        request.subscribe({
            next: () => {
                this.cerrarModal();
                this.cargar();
            },
            error: (err) => {
                this.errorModal = err.error?.mensaje || 'Error al guardar la categoría';
            }
        });
    }

    pedirEliminar(categoria: Categoria): void {
        this.porEliminar = categoria;
    }

    confirmarEliminar(): void {
        if (!this.porEliminar?._id) return;
        this.categoriaService.eliminarCategoria(this.porEliminar._id).subscribe({
            next: () => {
                this.porEliminar = null;
                this.cargar();
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'No se pudo eliminar la categoría';
                this.porEliminar = null;
            }
        });
    }
}
