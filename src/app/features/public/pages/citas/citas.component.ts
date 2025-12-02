import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuscadorComponent } from '../../../../shared/components/buscador/buscador.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { MedicoService } from '../../../../core/services/rol/medico.service';
import { SubespecialidadService, Subespecialidad } from '../../../../core/services/pages/subespecialidad.service';
import { EspecialidadService, Especialidad } from '../../../../core/services/pages/especialidad.service';
import { HorarioService } from '../../../../core/services/logic/horario.service';
import { DiaHorario, HorariosMedicoResponse } from '../../../../core/models/common/cita';

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
  private horarioService = inject(HorarioService);

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

    // Cargar horarios ocupados desde localStorage
    this.cargarHorariosOcupados();

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

  // =================================================== 
  // HORARIOS DINÁMICOS POR MÉDICO (REEMPLAZA ESTÁTICOS)
  // ===================================================
  horariosMedico: Record<number, HorariosMedicoResponse> = {};
  diaSeleccionadoPorMedico: Record<number, string> = {};
  horarioSeleccionadoPorMedico: Record<number, string> = {};
  
  // Almacén de horarios ocupados para evitar doble reserva
  horariosOcupados: Record<string, string[]> = {};

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
          
          // Cargar horarios reales para cada médico
          if (m.idMedico) {
            this.cargarHorariosMedico(m.idMedico);
          }
          
          return {
            doctor: nombre,
            especialidad: m.especialidad || 'Medicina General',
            paciente: '',
            disponibilidad: [],
            medico: m
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

  // =================================================== 
  // MÉTODOS PARA HORARIOS DINÁMICOS
  // ===================================================
  private cargarHorariosMedico(idMedico: number) {
    this.horarioService.getHorariosPorMedico(idMedico).subscribe({
      next: (resp: HorariosMedicoResponse) => {
        this.horariosMedico[idMedico] = resp;
        // Seleccionar el primer día disponible por defecto
        if (resp.dias && resp.dias.length > 0) {
          this.diaSeleccionadoPorMedico[idMedico] = resp.dias[0].fecha;
        }
      },
      error: (err) => {
        console.error(`Error cargando horarios para médico ${idMedico}:`, err);
      }
    });
  }

  getDiasDelMedico(idMedico: number): DiaHorario[] {
    return this.horariosMedico[idMedico]?.dias || [];
  }

  // Método para compatibilidad con el template
  getDiasDisponibles(cita: any): DiaHorario[] {
    const idMedico = cita.medico?.idMedico;
    return idMedico ? this.getDiasDelMedico(idMedico) : [];
  }

  // ===================================================
  // FORMATO DE FECHAS Y SEMANA ACTUAL
  // ===================================================
  
  // Formatear fecha con día y mes corto (ej: "15 nov")
  formatearFechaCorta(fecha: string): string {
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate();
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 
                   'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const mesCorto = meses[fechaObj.getMonth()];
    return `${dia} ${mesCorto}`;
  }

  // Formatear día de la semana corto (ej: "Lun", "Mar")
  formatearDiaSemana(fecha: string): string {
    const fechaObj = new Date(fecha);
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[fechaObj.getDay()];
  }

  // Obtener fechas de la semana actual (lunes a domingo)
  private obtenerSemanaActual(): string[] {
    const hoy = new Date();
    const diaDeLaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, etc.
    const diasHastaLunes = diaDeLaSemana === 0 ? -6 : 1 - diaDeLaSemana;
    
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diasHastaLunes);
    
    const fechasSemana: string[] = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(lunes);
      dia.setDate(lunes.getDate() + i);
      fechasSemana.push(dia.toISOString().split('T')[0]);
    }
    
    return fechasSemana;
  }

  // Obtener días disponibles filtrados por semana actual
  getDiasDisponiblesSemana(cita: any): any[] {
    const idMedico = cita.medico?.idMedico;
    if (!idMedico) return [];
    
    const diasMedico = this.getDiasDelMedico(idMedico);
    const fechasSemanaActual = this.obtenerSemanaActual();
    
    // Filtrar solo los días que están en la semana actual
    const diasFiltrados = diasMedico.filter(dia => 
      fechasSemanaActual.includes(dia.fecha)
    );
    
    // Mapear con formato mejorado
    return diasFiltrados.map(dia => ({
      fecha: dia.fecha,
      diaSemana: this.formatearDiaSemana(dia.fecha),
      fechaCorta: this.formatearFechaCorta(dia.fecha),
      horarios: dia.horarios,
      esSeleccionado: this.diaSeleccionadoPorMedico[idMedico] === dia.fecha
    }));
  }

  // Verificar si hay horarios en la semana actual
  tieneHorariosSemanaActual(cita: any): boolean {
    return this.getDiasDisponiblesSemana(cita).length > 0;
  }

  // ===================================================
  // GESTIÓN DE HORARIOS OCUPADOS
  // ===================================================
  
  // Marcar un horario como ocupado
  private marcarHorarioOcupado(idMedico: number, fecha: string, horario: string): void {
    const key = `${idMedico}-${fecha}`;
    if (!this.horariosOcupados[key]) {
      this.horariosOcupados[key] = [];
    }
    if (!this.horariosOcupados[key].includes(horario)) {
      this.horariosOcupados[key].push(horario);
    }
    // Guardar en localStorage para persistencia
    localStorage.setItem('horariosOcupados', JSON.stringify(this.horariosOcupados));
  }

  // Verificar si un horario está ocupado
  private esHorarioOcupado(idMedico: number, fecha: string, horario: string): boolean {
    const key = `${idMedico}-${fecha}`;
    return this.horariosOcupados[key]?.includes(horario) || false;
  }

  // Cargar horarios ocupados desde localStorage
  private cargarHorariosOcupados(): void {
    const horariosGuardados = localStorage.getItem('horariosOcupados');
    if (horariosGuardados) {
      try {
        this.horariosOcupados = JSON.parse(horariosGuardados);
      } catch (e) {
        console.warn('Error cargando horarios ocupados:', e);
        this.horariosOcupados = {};
      }
    }
  }

  // Filtrar horarios disponibles (excluir ocupados)
  private filtrarHorariosDisponibles(idMedico: number, fecha: string, horarios: string[]): string[] {
    return horarios.filter(horario => !this.esHorarioOcupado(idMedico, fecha, horario));
  }

  private getHorariosDelDiaInterno(idMedico: number, fecha: string): string[] {
    const dias = this.getDiasDelMedico(idMedico);
    const dia = dias.find(d => d.fecha === fecha);
    return dia?.horarios || [];
  }

  seleccionarDiaCard(idMedico: number, fecha: string) {
    this.diaSeleccionadoPorMedico[idMedico] = fecha;
    this.horarioSeleccionadoPorMedico[idMedico] = ''; // Reset horario al cambiar día
  }

  seleccionarHorarioCard(idMedico: number, horario: string) {
    this.horarioSeleccionadoPorMedico[idMedico] = horario;
  }

  getHorariosDelDiaSeleccionado(idMedico: number): string[] {
    const fechaSeleccionada = this.diaSeleccionadoPorMedico[idMedico];
    return fechaSeleccionada ? this.getHorariosDelDiaInterno(idMedico, fechaSeleccionada) : [];
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

  // ===================================================
  // MÉTODOS ADAPTADOS AL NUEVO SISTEMA
  // ===================================================
  getCardState(cita: any) {
    const idMedico = cita.medico?.idMedico;
    if (!idMedico) return { diaSeleccionado: '', horarioSeleccionado: '' };
    
    return {
      diaSeleccionado: this.diaSeleccionadoPorMedico[idMedico] || '',
      horarioSeleccionado: this.horarioSeleccionadoPorMedico[idMedico] || ''
    };
  }  getHorariosDelDia(cita: any): string[] {
    const idMedico = cita.medico?.idMedico;
    if (!idMedico) return [];
    
    const fechaSeleccionada = this.diaSeleccionadoPorMedico[idMedico];
    if (!fechaSeleccionada) return [];
    
    const horariosCompletos = this.getHorariosDelDiaInterno(idMedico, fechaSeleccionada);
    // Filtrar horarios ocupados
    return this.filtrarHorariosDisponibles(idMedico, fechaSeleccionada, horariosCompletos);
  }

  getDiaActual(cita: any) {
    const idMedico = cita.medico?.idMedico;
    if (!idMedico) return null;
    
    const fechaSeleccionada = this.diaSeleccionadoPorMedico[idMedico];
    const dias = this.getDiasDelMedico(idMedico);
    return dias.find(d => d.fecha === fechaSeleccionada);
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
    const idMedico = cita.medico?.idMedico;
    if (!idMedico) {
      alert('Error: No se puede identificar al médico');
      return;
    }
    
    const diaSeleccionado = this.diaSeleccionadoPorMedico[idMedico];
    const horarioSeleccionado = this.horarioSeleccionadoPorMedico[idMedico];
    
    if (!diaSeleccionado || !horarioSeleccionado) {
      alert('Por favor selecciona un día y un horario');
      return;
    }

    this.citaParaReservar = cita;
    this.horarioParaReservar = horarioSeleccionado;
    this.mostrarModal = true;

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
      const idMedico = this.citaParaReservar.medico?.idMedico;
      const fechaSeleccionada = this.diaSeleccionadoPorMedico[idMedico];
      const horarioSeleccionado = this.horarioSeleccionadoPorMedico[idMedico];
      
      // Marcar horario como ocupado ANTES de ir al checkout
      if (idMedico && fechaSeleccionada && horarioSeleccionado) {
        this.marcarHorarioOcupado(idMedico, fechaSeleccionada, horarioSeleccionado);
        // Limpiar selección para forzar actualización visual
        this.horarioSeleccionadoPorMedico[idMedico] = '';
      }
      
      this.router.navigate(['/checkout'], {
        queryParams: {
          doctor: this.citaParaReservar.doctor,
          especialidad: this.citaParaReservar.especialidad,
          fecha: fechaSeleccionada,
          hora: horarioSeleccionado,
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
