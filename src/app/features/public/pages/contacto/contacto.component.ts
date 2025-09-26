import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormControl, FormGroup, Validators, NonNullableFormBuilder} from '@angular/forms';
import { Contacto } from '../../../../core/models/common/contacto';

type ContactoForm = {
  nombre: FormControl<string>;
  correo: FormControl<string>;
  telefono: FormControl<string>;
  asunto: FormControl<string>;
  tipoConsulta: FormControl<string>;
  mensaje: FormControl<string>;
};

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {

  readonly tiposConsulta = [
    'Agendar cita',
    'Consulta sobre adopción',
    'Emergencia',
    'Consulta sobre productos',
    'Información sobre servicios',
    'Otro'
  ] as const;

  readonly phoneRegex = /^(9\d{8}|0?\d{7,9})$/;

  readonly form: FormGroup<ContactoForm>;
  sending = false;
  sentOk: boolean | null = null;

  constructor(private fb: NonNullableFormBuilder) {
    this.form = this.fb.group<ContactoForm>({
      nombre: this.fb.control('', { validators: [Validators.required, Validators.minLength(2)] }),
      correo: this.fb.control('', { validators: [Validators.required, Validators.email] }),
      telefono: this.fb.control('', { validators: [Validators.pattern(this.phoneRegex)] }),
      asunto: this.fb.control('', { validators: [Validators.required, Validators.minLength(3)] }),
      tipoConsulta: this.fb.control('', { validators: [Validators.required] }),
      mensaje: this.fb.control('', { validators: [Validators.required, Validators.minLength(10), Validators.maxLength(1000)] }),
    });
  }

  // getters tipados para template estricto
  get nombre() { return this.form.controls.nombre; }
  get correo() { return this.form.controls.correo; }
  get telefono() { return this.form.controls.telefono; }
  get asunto() { return this.form.controls.asunto; }
  get tipoConsulta() { return this.form.controls.tipoConsulta; }
  get mensaje() { return this.form.controls.mensaje; }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.sending = true; this.sentOk = null;
    try {
      const payload: Contacto = {
        ...this.form.getRawValue(),
        telefono: this.telefono.value?.trim() || undefined
      };
      console.log('Contacto enviado:', payload);
      await new Promise(r => setTimeout(r, 700));
      this.sentOk = true;
      this.form.reset();
    } catch {
      this.sentOk = false;
    } finally {
      this.sending = false;
    }
  }
}


