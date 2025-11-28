import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuscadorComponent } from '../../../../shared/components/buscador/buscador.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { HORARIOS_POR_DIA, DIAS_DISPONIBLES, DiaDisponible } from './citas.data';
import { MedicoService } from '../../../../core/services/rol/medico.service';
import { SubespecialidadService, Subespecialidad } from '../../../../core/services/pages/subespecialidad.service';
import { EspecialidadService, Especialidad } from '../../../../core/services/pages/especialidad.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, BuscadorComponent],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})

export class CitasComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private subespService = inject(SubespecialidadService);
  private espService = inject(EspecialidadService);
  private medicoService = inject(MedicoService);

  mostrarModal = false;
  citaParaReservar: any = null;
  horarioParaReservar: string = '';

  datosCita = {
    motivo: '',
    tipoConsulta: 'consulta-general',
    observaciones: ''
  };

  // Subespecialidades dinámicas según la especialidad elegida
  subespecialidades: Subespecialidad[] = [];
  subespecialidadSeleccionadaId: number | null = null;
  precioSeleccionado: number | null = null;
  idEspecialidadResuelta: number | null = null;

  ngOnInit(): void {
    this.resultadosBuscadorDoctor = [];
    this.resultadosBuscadorEspecialidad = [];

    this.route.paramMap.subscribe(params => {
      const idEspecialidadParam = params.get('idEspecialidad');
      if (idEspecialidadParam) {
        // si es número considerarlo id, si no, tomarlo como nombre minúscula
        const num = Number(idEspecialidadParam);
        if (!Number.isNaN(num)) {
          this.idEspecialidadResuelta = num;
          this.cargarSubespecialidades(num);
        } else {
          this.selectedEspecialidad = idEspecialidadParam.toLowerCase();
          this.resolverIdEspecialidadPorNombre(this.selectedEspecialidad);
        }
      }
    });
    this.cargarMedicosDesdeApi();
  }

  citas: any[] = [];

  cargandoMedicos = false;
  errorMedicos: string | null = null;

  selectedEspecialidad: string | null = null;
  busqueda: any[] = [];

  resultadosBuscadorDoctor: any[] = [];
  resultadosBuscadorEspecialidad: any[] = [];

  cardStates: { [doctorName: string]: { diaSeleccionado: string, horarioSeleccionado: string } } = {};

  horariosPorDia: Record<string, string[]> = HORARIOS_POR_DIA;

  diasDisponibles: DiaDisponible[] = DIAS_DISPONIBLES;

  // Perfil modal
  mostrarPerfilModal = false;
  perfilMedicoSeleccionado: any = null;

  onBuscarDoctor(resultados: any[]) {
    this.resultadosBuscadorDoctor = resultados;
  }

  private cargarMedicosDesdeApi() {
    this.cargandoMedicos = true;
    this.errorMedicos = null;
    this.medicoService.getMedicos().subscribe({
      next: (lista: any[]) => {
        // Mapear la respuesta del API a la estructura Cita usada en la UI
        this.citas = (lista || []).map(m => {
          const persona = m.persona || {};
          const nombre = [persona.nombre1, persona.apellidoPaterno].filter(Boolean).join(' ') || persona.nombre1 || persona.apellidoPaterno || m.colegiatura || 'Dr.';
          return {
            doctor: nombre,
            especialidad: m.especialidad || 'Medicina General',
            paciente: '',
            disponibilidad: [],
            medico: m // keep original medico object for details (colegiatura, email, etc.)
          };
        });
        this.cargandoMedicos = false;
      },
      error: (err: any) => {
        console.error('Error cargando médicos:', err);
        this.errorMedicos = 'No se pudo cargar la lista de médicos';
        this.cargandoMedicos = false;
        this.citas = [];
      }
    });
  }

  onBuscarEspecialidad(resultados: any[]) {
    this.resultadosBuscadorEspecialidad = resultados;
  }

  get citasFiltradas() {
    let data = [...this.citas];

    if (this.resultadosBuscadorDoctor.length > 0 && this.resultadosBuscadorDoctor.length < this.citas.length) {
      data = data.filter(cita =>
        this.resultadosBuscadorDoctor.some(resultado => resultado.doctor === cita.doctor)
      );
    }

    if (this.resultadosBuscadorEspecialidad.length > 0 && this.resultadosBuscadorEspecialidad.length < this.citas.length) {
      data = data.filter(cita =>
        this.resultadosBuscadorEspecialidad.some(resultado => resultado.especialidad === cita.especialidad)
      );
    }

    if (this.selectedEspecialidad) {
      data = data.filter(c => c.especialidad.toLowerCase() === this.selectedEspecialidad);
    }

    return data;
  }

  seleccionarEspecialidad(especialidad: string | null) {
    this.selectedEspecialidad = especialidad;
  }

  getCardState(doctorName: string) {
    if (!this.cardStates[doctorName]) {
      this.cardStates[doctorName] = {
        diaSeleccionado: 'jueves',
        horarioSeleccionado: ''
      };
    }
    return this.cardStates[doctorName];
  }

  seleccionarDiaCard(doctorName: string, dia: string) {
    const state = this.getCardState(doctorName);
    state.diaSeleccionado = dia;
    state.horarioSeleccionado = ''; 
  }

  seleccionarHorarioCard(doctorName: string, horario: string) {
    const state = this.getCardState(doctorName);
    state.horarioSeleccionado = horario;
  }

  getHorariosDelDia(doctorName: string): string[] {
    const state = this.getCardState(doctorName);
    return this.horariosPorDia[state.diaSeleccionado] || [];
  }

  getDiaActual(doctorName: string) {
    const state = this.getCardState(doctorName);
    return this.diasDisponibles.find(d => d.codigo === state.diaSeleccionado);
  }

  onBuscarResultados(resultados: any[]) {
    this.busqueda = resultados.map(r => ({
      ...r,
      doctor: r.doctor.trim().toLowerCase(),
      especialidad: r.especialidad.trim().toLowerCase(),
      paciente: r.paciente.trim().toLowerCase()
    }));
  }

  seleccionarHorario(cita: any, horario: string) {
    const mensaje = `¿Deseas reservar una cita con ${cita.doctor} el ${horario}?`;

    if (confirm(mensaje)) {
      alert(`✅ Cita reservada con ${cita.doctor} a las ${horario}. Te contactaremos pronto para confirmar.`);
    }
  }

  verPerfil(cita: any) {
    this.perfilMedicoSeleccionado = cita.medico || null;
    this.mostrarPerfilModal = true;
  }

  cerrarPerfil() {
    this.mostrarPerfilModal = false;
    this.perfilMedicoSeleccionado = null;
  }

  reservarCita(cita: any) {
    const state = this.getCardState(cita.doctor);
    if (!state.horarioSeleccionado) {
      alert('Por favor selecciona un horario primero');
      return;
    }

    this.citaParaReservar = cita;
    this.horarioParaReservar = state.horarioSeleccionado;
    this.mostrarModal = true;

    // Resolver subespecialidades para la especialidad de la tarjeta
    this.resolverIdEspecialidadPorNombre(cita.especialidad);
  }

  verificarYContinuar() {
    const usuario = this.authService.currentUser;

    if (usuario) {

      this.procesarReservaCita();
    } else {
      this.mostrarOpcionesAuth();
    }
  }

  mostrarOpcionesAuth() {
    const mensaje = '¿Ya tienes una cuenta?\n\n' +
      '✅ SÍ - Inicia sesión\n' +
      '❌ NO - Regístrate primero';

    if (confirm(mensaje)) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: '/citas',
          reserva: 'pendiente',
          doctor: this.citaParaReservar.doctor,
          horario: this.horarioParaReservar
        }
      });
    } else {
      this.router.navigate(['/registro'], {
        queryParams: {
          returnUrl: '/citas',
          reserva: 'pendiente',
          doctor: this.citaParaReservar.doctor,
          horario: this.horarioParaReservar
        }
      });
    }
  }

  procesarReservaCita() {
    if (!this.datosCita.motivo.trim()) {
      alert('Por favor indica el motivo de la consulta');
      return;
    }

    const usuario = this.authService.currentUser;
    console.log('Usuario:', usuario);
    console.log('Cita:', this.citaParaReservar);
    if (usuario?.rol?.nombre === 'Paciente' && this.citaParaReservar) {
      this.router.navigate(['/checkout'], {
        queryParams: {
          doctor: this.citaParaReservar.doctor,
          especialidad: this.citaParaReservar.especialidad,
          fecha: new Date().toISOString().split('T')[0],
          hora: this.horarioParaReservar,
          idEspecialidad: this.idEspecialidadResuelta ?? undefined,
          idSubespecialidad: this.subespecialidadSeleccionadaId ?? undefined
        }
      });
    }
    this.cerrarModal();
  }

  // Helpers para subespecialidades
  private normalizar(t: string): string {
    return (t || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim();
  }

  private resolverIdEspecialidadPorNombre(nombre: string) {
    if (!nombre) return;
    const objetivo = this.normalizar(nombre);
    this.espService.getEspecialidades().subscribe({
      next: (lista: Especialidad[]) => {
        const esp = lista.find(e => this.normalizar(e.nombre) === objetivo);
        if (esp) {
          this.idEspecialidadResuelta = esp.idEspecialidad;
          this.cargarSubespecialidades(esp.idEspecialidad);
        }
      }
    });
  }

  private cargarSubespecialidades(idEspecialidad: number) {
    if (!idEspecialidad) return;
    this.subespecialidades = [];
    this.subespService.getSubespecialidadesPorEspecialidad(idEspecialidad).subscribe({
      next: (subs: Subespecialidad[]) => {
        this.subespecialidades = subs;
        if (subs && subs.length) {
          this.subespecialidadSeleccionadaId = subs[0].idSubespecialidad;
          this.precioSeleccionado = subs[0].precioSubespecial;
        } else {
          this.subespecialidadSeleccionadaId = null;
          this.precioSeleccionado = null;
        }
      },
      error: () => {
        this.subespecialidadSeleccionadaId = null;
        this.precioSeleccionado = null;
      }
    });
  }

  onSubespecialidadChange(idStr: string) {
    const id = Number(idStr);
    this.subespecialidadSeleccionadaId = Number.isNaN(id) ? null : id;
    const sel = this.subespecialidades.find(s => s.idSubespecialidad === this.subespecialidadSeleccionadaId!);
    this.precioSeleccionado = sel?.precioSubespecial ?? null;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.citaParaReservar = null;
    this.horarioParaReservar = '';
    this.datosCita = {
      motivo: '',
      tipoConsulta: 'consulta-general',
      observaciones: ''
    };
  }

  irALogin() {
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: '/citas',
        reserva: 'pendiente'
      }
    });
  }

  irARegistro() {
    this.router.navigate(['/registro'], {
      queryParams: {
        returnUrl: '/citas',
        reserva: 'pendiente'
      }
    });
  }

  get estaLogueado(): boolean {
    return !!this.authService.currentUser;
  }

}
