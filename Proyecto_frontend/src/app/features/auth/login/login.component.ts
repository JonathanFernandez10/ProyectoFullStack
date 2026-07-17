import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule
}
    from '@angular/forms';

import { AuthService }
    from '../../../core/services/auth.service';

import { Router, RouterLink }
from '@angular/router';

import { LogoComponent }
    from '../../../shared/components/logo/logo.component';

@Component({
    selector: 'app-login',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        LogoComponent
    ],
    templateUrl: './login.component.html',
})

export class LoginComponent {
    loginForm: FormGroup;
    cargando = false;
    error: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {

        this.loginForm = this.fb.group({
            email: [
                '',
                [
                    Validators.required,
                    Validators.email
                ]
            ],
            password: [
                '',
                [
                    Validators.required
                ]
            ]
        });
    }

    onSubmit(): void {
        if (
            this.loginForm.invalid
        ) {
            this.loginForm.markAllAsTouched();
            return;
        }
        const {
            email,
            password
        } = this.loginForm.value;

        this.cargando = true;
        this.error = null;

        this.authService.login(
            email,
            password
        ).subscribe({
            next: (response) => {
                this.authService.saveSession(response);
                this.cargando = false;
                this.router.navigate([this.authService.landingRouteForRole(response.usuario.rol)]);
            },
            error: (error) => {
                this.cargando = false;
                this.error = error.error?.mensaje || 'No se pudo iniciar sesión';
            }
        });
    }

}
