import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirm-dialog',
    imports: [CommonModule],
    templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
    @Input() titulo = 'Confirmar';
    @Input() mensaje = '¿Estás seguro?';
    @Output() confirmar = new EventEmitter<void>();
    @Output() cancelar = new EventEmitter<void>();
}
