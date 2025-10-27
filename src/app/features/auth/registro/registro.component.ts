import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Usuario } from '../../../core/models/users/usuario';
import { Paciente } from '../../../core/models/users/paciente';
import { Doctor } from '../../../core/models/users/doctor';
import { Admin } from '../../../core/models/users/admin';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatOption } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { UbigeoService, Departamento, Provincia, Distrito } from '../../../core/services/forms/ubigeo.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TipoDocumento, } from '../../../core/models/common/tipo-documento';
import { TipoDocumentoService } from '../../../core/services/forms/tipoDocumento.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatSelectModule,
    MatOption,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  datosForm: any;
  personalesForm: any;
  credencialesForm: any;
  mostrarPassword: boolean = false;
  mostrarConfirmarPassword: boolean = false;
  today = new Date();
  startDate = new Date(this.today.getFullYear() - 25, 0, 1);
  minDate = new Date(this.today.getFullYear() - 120, 0, 1);
  maxDate = this.today;

  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  distritos: Distrito[] = [];
  tiposDocumento: TipoDocumento[] = TipoDocumentoService.getTodosLosTipos();
  mostrarMensajeExito: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ubigeoService: UbigeoService) { }

  verContrasena() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  verConfirmarContrasena() {
    this.mostrarConfirmarPassword = !this.mostrarConfirmarPassword;
  }

  fechaNacimientoValida(control: any) {
    const fecha = control.value;
    if (!fecha) return null;
    if (fecha < this.minDate || fecha > this.maxDate) {
      return { fechaInvalida: true };
    }
    return null;
  }

  registrar() {
    if (this.datosForm.valid && this.personalesForm.valid && this.credencialesForm.valid) {
      const nuevoPaciente: Paciente = {
        id: Date.now(),
        tipoDocumento: this.datosForm.value.tipoDocumento!,
        numeroDocumento: this.datosForm.value.dni!,
        fechaNacimiento: this.datosForm.value.fechaNacimiento!,
        nombre: this.personalesForm.value.nombre!,
        apellidoPaterno: this.personalesForm.value.apellidoPaterno!,
        apellidoMaterno: this.personalesForm.value.apellidoMaterno!,
        genero: this.personalesForm.value.genero!,
        pais: this.personalesForm.value.pais!,
        departamento: this.personalesForm.value.departamento!,
        provincia: this.personalesForm.value.provincia!,
        distrito: this.personalesForm.value.distrito!,
        domicilio: this.personalesForm.value.domicilio!,
        telefono: this.credencialesForm.value.celular!,
        email: this.credencialesForm.value.correo!,
        password: this.credencialesForm.value.password!,
        rol: 'paciente',
        // Puedes agregar aquí más campos de Paciente si lo deseas
      };

      // Guardar como array de (Usuario | Paciente | Doctor | Admin)[]
      let usuarios: (Usuario | Paciente | Doctor | Admin)[] = JSON.parse(localStorage.getItem('usuarios') || '[]');
      usuarios.push(nuevoPaciente);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));

      this.mostrarMensajeExito = true;

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    }
  }

  private passwordsMatch(group: any) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { notSame: true };
  }

  ngOnInit() {

    this.initializeForms();
    this.cargarDepartamentos();


    this.datosForm.get('tipoDocumento')?.valueChanges.subscribe((tipoCodigo: string) => {
      const numeroCtrl = this.datosForm.get('dni');
      numeroCtrl?.clearValidators(); 

      const tipoDocumento = TipoDocumentoService.getTipoDocumento(tipoCodigo);

      if (tipoDocumento) {
        numeroCtrl?.setValidators([
          Validators.required,
          Validators.pattern(tipoDocumento.patron),
          Validators.minLength(tipoDocumento.longitudMinima),
          Validators.maxLength(tipoDocumento.longitudMaxima)
        ]);
      }

      numeroCtrl?.updateValueAndValidity();
    });

    this.cargarDepartamentos();
  }

  private initializeForms() {
    this.datosForm = this.fb.group({
      tipoDocumento: ['', Validators.required],
      dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      fechaNacimiento: ['', [Validators.required, this.fechaNacimientoValida.bind(this)]],
      terminos: [false, Validators.requiredTrue],
      autorizacion: [false, Validators.requiredTrue]
    });

    this.personalesForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      genero: ['', Validators.required],
      pais: ['', Validators.required],
      domicilio: ['', Validators.required],
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required]
    });

    this.credencialesForm = this.fb.group({
      celular: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(12),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@%$!#?&*-/+]).+$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  cargarDepartamentos() {
    console.log('🚀 Iniciando carga de departamentos...');
    this.ubigeoService.getDepartamentos().subscribe({
      next: (departamentos: Departamento[]) => {
        console.log(' Departamentos recibidos en componente:', departamentos);
        this.departamentos = departamentos;
      },
      error: (error: any) => {
        console.error(' Error cargando departamentos:', error);
      }
    });
  }

  onDepartamentoChange(event: any) {
    const codigoDepartamento = event.value;
    this.provincias = [];
    this.distritos = [];
    this.personalesForm.patchValue({
      provincia: '',
      distrito: ''
    });

    if (codigoDepartamento) {
      this.ubigeoService.getProvincias(codigoDepartamento).subscribe({
        next: (provincias: Provincia[]) => {
          this.provincias = provincias;
        },
        error: (error: any) => {
          console.error('Error cargando provincias:', error);
        }
      });
    }
  }

  onProvinciaChange(event: any) {
    const codigoProvincia = event.value;
    this.distritos = [];
    this.personalesForm.patchValue({
      distrito: ''
    });

    if (codigoProvincia) {
      this.ubigeoService.getDistritos(codigoProvincia).subscribe({
        next: (distritos: Distrito[]) => {
          this.distritos = distritos;
        },
        error: (error: any) => {
          console.error('Error cargando distritos:', error);
        }
      });
    }
  }

  getPlaceholderDocumento(): string {
    const tipoCodigo = this.datosForm?.get('tipoDocumento')?.value;
    const tipoDocumento = TipoDocumentoService.getTipoDocumento(tipoCodigo);
    return tipoDocumento?.placeholder || 'Ingrese documento';
  }

  getNombreTipoDocumento(): string {
    const tipoCodigo = this.datosForm?.get('tipoDocumento')?.value;
    const tipoDocumento = TipoDocumentoService.getTipoDocumento(tipoCodigo);
    return tipoDocumento?.nombre || 'Número de documento';
  }

  getMensajeError(): string {
    const tipoCodigo = this.datosForm?.get('tipoDocumento')?.value;
    return TipoDocumentoService.getMensajeError(tipoCodigo);
  }
}