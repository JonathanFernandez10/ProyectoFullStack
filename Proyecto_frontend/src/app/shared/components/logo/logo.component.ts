import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-logo',
    imports: [CommonModule],
    templateUrl: './logo.component.html'
})
export class LogoComponent {
    /** 'icon' = solo isotipo · 'lockup' = isotipo + wordmark */
    @Input() variant: 'icon' | 'lockup' = 'icon';

    /** 'onDark' = para superficies navy · 'onLight' = para superficies claras */
    @Input() scheme: 'onLight' | 'onDark' = 'onLight';

    /** Texto principal del lockup */
    @Input() nombre = 'SmartInventory';

    /** Sublínea del lockup */
    @Input() sublinea = 'Bodegas del Istmo, S.A.';

    /** Tamaño del isotipo en px (clase h-/w- equivalente) */
    @Input() size = 36;
}
