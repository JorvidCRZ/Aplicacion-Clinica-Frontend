import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, NonNullableFormBuilder } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ContactoService } from '../../../../core/services/forms/contacto.service';

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
    'Agendar cita médica',
    'Consulta médica general',
    'Urgencia/Emergencia',
    'Información sobre especialidades',
    'Consulta sobre tratamientos',
    'Resultados médicos',
    'Seguro médico y pagos',
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

  // inyectar servicio
  private contactoService = inject(ContactoService);

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.sending = true; this.sentOk = null;
    try {
      const raw = this.form.getRawValue();
      const payload: any = {
        nombre: (raw.nombre || '').trim(),
        correo: (raw.correo || '').trim(),
        telefono: raw.telefono?.trim() || undefined,
        asunto: raw.asunto || undefined,
        tipoConsulta: raw.tipoConsulta || undefined,
        mensaje: raw.mensaje || undefined
      };

      await firstValueFrom(this.contactoService.crear(payload));
      this.sentOk = true;
      this.form.reset();
    } catch (e) {
      console.error('Error enviando contacto', e);
      this.sentOk = false;
    } finally {
      this.sending = false;
    }
  }
}


