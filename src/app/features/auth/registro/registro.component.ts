import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Usuario } from '../../../core/models/users/usuario';
import { Paciente } from '../../../core/models/users/paciente';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatOption } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { UbigeoService, Departamento, Provincia, Distrito } from '../../../core/services/ubigeo.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TipoDocumento, } from '../../../core/models/common/tipo-documento';
import { TipoDocumentoService } from '../../../core/services/tipoDocumento.service';

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

  // Paso 1: datos básicos
  datosForm: any;
  // Paso 2: datos personales
  personalesForm: any;
  // Paso 3: credenciales
  credencialesForm: any;
  mostrarPassword: boolean = false;
  mostrarConfirmarPassword: boolean = false;
  today = new Date();
  startDate = new Date(this.today.getFullYear() - 25, 0, 1);
  minDate = new Date(this.today.getFullYear() - 120, 0, 1);
  maxDate = this.today;
  // 🔥 DATOS DE UBIGEO
  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  distritos: Distrito[] = [];

  // 🔥 TIPOS DE DOCUMENTO
  tiposDocumento: TipoDocumento[] = TipoDocumentoService.getTodosLosTipos();

  // 🔥 MENSAJE DE ÉXITO
  mostrarMensajeExito: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ubigeoService: UbigeoService // 🔥 INYECTAR EL SERVICIO HTTP
  ) {
    // Los formularios se inicializarán en ngOnInit
  }

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

        // 🔥 DATOS BÁSICOS
        tipoDocumento: this.datosForm.value.tipoDocumento!,
        numeroDocumento: this.datosForm.value.dni!,
        fechaNacimiento: this.datosForm.value.fechaNacimiento!,

        // 🔥 DATOS PERSONALES
        nombre: this.personalesForm.value.nombre!,
        apellidoPaterno: this.personalesForm.value.apellidoPaterno!,
        apellidoMaterno: this.personalesForm.value.apellidoMaterno!,
        genero: this.personalesForm.value.genero!,
        pais: this.personalesForm.value.pais!,
        departamento: this.personalesForm.value.departamento!,
        provincia: this.personalesForm.value.provincia!,
        distrito: this.personalesForm.value.distrito!,
        domicilio: this.personalesForm.value.domicilio!,

        // 🔥 CREDENCIALES
        telefono: this.credencialesForm.value.celular!,
        email: this.credencialesForm.value.correo!,
        password: this.credencialesForm.value.password!,
        rol: 'paciente'
      };

      let usuarios: Usuario[] = JSON.parse(localStorage.getItem('usuarios') || '[]');
      usuarios.push(nuevoPaciente);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));

      // 🎉 Mostrar mensaje de éxito
      this.mostrarMensajeExito = true;

      // Redirigir al login después de 3 segundos
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

  // 🔥 MÉTODOS DE UBIGEO
  ngOnInit() {
    // Inicializar formularios
    this.initializeForms();
    // Cargar datos de ubigeo
    this.cargarDepartamentos();


    this.datosForm.get('tipoDocumento')?.valueChanges.subscribe((tipoCodigo: string) => {
      const numeroCtrl = this.datosForm.get('dni');
      numeroCtrl?.clearValidators(); // Limpiar validaciones anteriores

      const tipoDocumento = TipoDocumentoService.getTipoDocumento(tipoCodigo);

      if (tipoDocumento) {
        numeroCtrl?.setValidators([
          Validators.required,
          Validators.pattern(tipoDocumento.patron),
          Validators.minLength(tipoDocumento.longitudMinima),
          Validators.maxLength(tipoDocumento.longitudMaxima)
        ]);
      }

      numeroCtrl?.updateValueAndValidity(); // Aplicar nueva validación
    });

    // Cargar datos de ubigeo
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

    // Reset de provincia y distrito
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

    // Reset de distrito
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

  // 🔥 MÉTODOS AUXILIARES PARA TIPOS DE DOCUMENTO
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

  // 🔥 MÉTODO UNIFICADO PARA MENSAJES DE ERROR
  getMensajeError(): string {
    const tipoCodigo = this.datosForm?.get('tipoDocumento')?.value;
    return TipoDocumentoService.getMensajeError(tipoCodigo);
  }
}