import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-modal',
    imports: [CommonModule],
    templateUrl: './modal.component.html'
})
export class ModalComponent {
    @Input() titulo = '';
    @Output() cerrar = new EventEmitter<void>();
}
