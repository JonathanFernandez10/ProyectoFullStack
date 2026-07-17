import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { UsuarioService } from '../../core/services/usuario.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { Usuario, Rol } from '../../shared/interfaces/usuario.interface';
import { Proveedor } from '../../shared/interfaces/proveedor.interface';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-usuarios',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, ConfirmDialogComponent],
    templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {
    usuarios: Usuario[] = [];
    proveedores: Proveedor[] = [];
    busqueda = '';
    cargando = false;
    error: string | null = null;
    errorModal: string | null = null;

    modalAbierto = false;
    editandoId: string | null = null;
    porEliminar: Usuario | null = null;

    roles: Rol[] = ['admin', 'user', 'guest', 'proveedor'];

    form: FormGroup;

    constructor(
        private usuarioService: UsuarioService,
        private proveedorService: ProveedorService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            nombre: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: [''],
            rol: ['user', Validators.required],
            estado: ['activo', Validators.required],
            proveedor: ['']
        });
    }

    get usuariosFiltrados(): Usuario[] {
        const termino = this.busqueda.trim().toLowerCase();
        if (!termino) return this.usuarios;
        return this.usuarios.filter(u =>
            u.nombre.toLowerCase().includes(termino) || u.email.toLowerCase().includes(termino)
        );
    }

    get rolSeleccionado(): string {
        return this.form.get('rol')?.value;
    }

    ngOnInit(): void {
        this.cargar();
        this.proveedorService.getProveedores().subscribe(res => this.proveedores = res.proveedores);
    }

    cargar(): void {
        this.cargando = true;
        this.usuarioService.getUsuarios().subscribe({
            next: (res) => {
                this.usuarios = res.usuarios;
                this.cargando = false;
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'Error al cargar usuarios';
                this.cargando = false;
            }
        });
    }

    nombreProveedor(u: Usuario): string {
        if (!u.proveedor) return '—';
        return typeof u.proveedor === 'string' ? u.proveedor : u.proveedor.nombre;
    }

    abrirNuevo(): void {
        this.editandoId = null;
        this.form.reset({ nombre: '', email: '', password: '', rol: 'user', estado: 'activo', proveedor: '' });
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.form.get('password')?.updateValueAndValidity();
        this.errorModal = null;
        this.modalAbierto = true;
    }

    abrirEditar(usuario: Usuario): void {
        this.editandoId = usuario._id ?? null;
        const proveedorId = typeof usuario.proveedor === 'string' ? usuario.proveedor : usuario.proveedor?._id;
        this.form.reset({
            nombre: usuario.nombre,
            email: usuario.email,
            password: '',
            rol: usuario.rol,
            estado: usuario.estado,
            proveedor: proveedorId || ''
        });
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
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
        if (!datos.password) delete datos.password;
        if (datos.rol !== 'proveedor') datos.proveedor = null;

        if (datos.rol === 'proveedor' && !datos.proveedor) {
            this.errorModal = 'Selecciona el proveedor vinculado para el rol proveedor.';
            return;
        }

        const request = this.editandoId
            ? this.usuarioService.actualizarUsuario(this.editandoId, datos)
            : this.usuarioService.crearUsuario(datos);

        request.subscribe({
            next: () => {
                this.cerrarModal();
                this.cargar();
            },
            error: (err) => {
                this.errorModal = err.error?.mensaje || 'Error al guardar el usuario';
            }
        });
    }

    pedirEliminar(usuario: Usuario): void {
        this.porEliminar = usuario;
    }

    confirmarEliminar(): void {
        if (!this.porEliminar?._id) return;
        this.usuarioService.eliminarUsuario(this.porEliminar._id).subscribe({
            next: () => {
                this.porEliminar = null;
                this.cargar();
            },
            error: (err) => {
                this.error = err.error?.mensaje || 'No se pudo eliminar el usuario';
                this.porEliminar = null;
            }
        });
    }
}
