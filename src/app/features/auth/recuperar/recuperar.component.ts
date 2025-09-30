import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.css']
})
export class RecuperarComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      gmail: ['', [Validators.required, Validators.email]]  // ✅ ahora solo Gmail
    });
  }

  validar() {
    if (this.form.valid) {
      console.log('✅ Correo ingresado:', this.form.value.gmail);
      alert('Correo validado correctamente');
      // Aquí podrías redirigir al formulario de cambio de contraseña
      // this.router.navigate(['/cambiar-password']);
    }
  }

  cancelar() {
    console.log('❌ Proceso cancelado');
    this.router.navigate(['/login']); // o la ruta que corresponda en tu app
  }
}
