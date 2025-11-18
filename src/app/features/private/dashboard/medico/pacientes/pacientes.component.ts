import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicosService } from '../../../../../core/services/logic/medico.service';
import { PacienteService } from '../../../../../core/services/rol/paciente.service';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { CitaService } from '../../../../../core/services/logic/cita.service';

// 👤 Interfaces para gestión de pacientes
interface Paciente {
  id: number;
  nombre: string;
  documento: string;
  edad: number;
  genero: 'masculino' | 'femenino' | 'otro';
  telefono: string;
  email: string;
  ultimaCita: string;
  ultimoDiagnostico: string;
  fechaRegistro: string;
}

interface EstadisticasPacientes {
  porEdad: { [key: string]: number };
  porGenero: { masculino: number; femenino: number; otro: number };
  diagnosticosFrecuentes: { nombre: string; cantidad: number }[];
}

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css'
})
export class PacientesComponent implements OnInit {

  // 📊 Datos de pacientes
  pacientesOriginales: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];

  // 🎛️ Filtros y búsqueda
  busquedaTexto = '';
  filtroEdad = '';
  ordenamiento = 'nombre';
  vistaActual: 'tarjetas' | 'tabla' = 'tabla'; // Tabla por defecto para eficiencia

  // 📈 Estadísticas
  totalPacientes = 0;
  totalCitas = 0;
  citasEsteMes = 0;
  
  estadisticas: EstadisticasPacientes = {
    porEdad: {},
    porGenero: { masculino: 0, femenino: 0, otro: 0 },
    diagnosticosFrecuentes: []
  };

  constructor(
    private medicosService: MedicosService,
    private pacienteSrv: PacienteService,
    private auth: AuthService,
    private citaService: CitaService
  ) {}

  ngOnInit(): void {
    this.cargarPacientes();
    this.calcularEstadisticas();
    this.filtrarPacientes();
  }

  // 👥 Cargar pacientes dinámicos desde las Citas, filtrados por especialidad o por el propio médico
  private cargarPacientes(): void {
    const user = this.auth.currentUser;
    console.log('PacientesComponent.cargarPacientes - currentUser:', user);
    if (!user || !user.idUsuario) {
      console.log('PacientesComponent.cargarPacientes - no user or idUsuario, abortando');
      this.pacientesOriginales = [];
      return;
    }

    // Primero obtener el idMedico real asociado al usuario
    console.log('PacientesComponent.cargarPacientes - obteniendo medico por usuario:', user.idUsuario);
    this.medicosService.obtenerMedicoPorUsuario(user.idUsuario).subscribe({
      next: (medico: any) => {
        console.log('PacientesComponent.cargarPacientes - medico obtenido:', medico);

        const idMedico = medico?.idMedico ?? medico?.id ?? null;
        if (!idMedico) {
          console.warn('PacientesComponent.cargarPacientes - no se encontró idMedico en la respuesta del backend para este usuario');
          this.pacientesOriginales = [];
          this.calcularEstadisticas();
          this.filtrarPacientes();
          return;
        }

        
        this.pacienteSrv.obtenerPacientesPorMedico(idMedico).subscribe({
          next: (res: any[]) => {
            console.log('PacientesComponent.cargarPacientes - respuesta API pacientes:', res);
            // Debug: log contacto fields explicitly to detect naming/availability issues
            if (res && res.length > 0) {
              console.log('Primer registro raw:', res[0]);
              res.forEach((raw: any, i: number) => {
                console.log(`raw[${i}] keys:`, Object.keys(raw));
                console.log(`raw[${i}] contacto_telefonos:`, raw.contacto_telefonos);
                console.log(`raw[${i}] contacto_email:`, raw.contacto_email);
                console.log(`raw[${i}] contacto:`, raw.contacto);
                console.log(`raw[${i}] email:`, raw.email);
              });
            }
            this.pacientesOriginales = (res || []).map((p: any, idx: number) => ({
              id: p.idPaciente ?? (idx + 1),
              nombre: p.nombreCompleto ?? p.nombre ?? '—',
              documento: p.documento ?? '',
              edad: p.edad ?? 0,
              genero: (p.genero === 'masculino' || p.genero === 'femenino') ? p.genero : 'otro',
              // Map DB view fields. Accept both snake_case (from native query) and camelCase (from DTO JSON)
              telefono:
                p.contacto_telefonos ?? p.contactoTelefonos ?? p.contacto ?? p.telefono ?? '',
              email:
                p.contacto_email ?? p.contactoEmail ?? p.email ?? p.correo ?? '',
              ultimaCita: p.ultimaCita ?? '',
              ultimoDiagnostico: p.diagnostico ?? '—',
              fechaRegistro: p.fechaRegistro ?? ''
            }));

            console.log('PacientesComponent.cargarPacientes - pacientes mapeados:', this.pacientesOriginales.length, this.pacientesOriginales);
            // Calcular estadísticas básicas por ahora
            this.calcularEstadisticas();
            this.filtrarPacientes();

            // Pedir al backend los contadores reales por médico
            this.citaService.contarCitasPorMedico(idMedico).subscribe({
              next: (total: number) => {
                console.log('PacientesComponent - total citas por medico recibido:', total);
                this.totalCitas = Number(total || 0);
              },
              error: (err: any) => console.error('Error al obtener total de citas por medico:', err)
            });

            this.citaService.contarCitasDelMesActualPorMedico(idMedico).subscribe({
              next: (mesTotal: number) => {
                console.log('PacientesComponent - total citas este mes por medico recibido:', mesTotal);
                this.citasEsteMes = Number(mesTotal || 0);
              },
              error: (err: any) => console.error('Error al obtener total de citas del mes por medico:', err)
            });
          },
          error: (err: any) => {
            console.error('Error al obtener pacientes por médico:', err);
            this.pacientesOriginales = [];
            this.calcularEstadisticas();
            this.filtrarPacientes();
          }
        });
      },
      error: (err: any) => {
        console.error('PacientesComponent.cargarPacientes - error obteniendo medico por usuario:', err);
        this.pacientesOriginales = [];
        this.calcularEstadisticas();
        this.filtrarPacientes();
      }
    });
  }

  // 📊 Calcular estadísticas
  private calcularEstadisticas(): void {
  this.totalPacientes = this.pacientesOriginales.length;
  // Evitar la simulación que multiplicaba por 3. Mientras el backend responde, usar un valor conservador.
  this.totalCitas = this.pacientesOriginales.length;
    this.citasEsteMes = this.pacientesOriginales.filter(p => 
      new Date(p.ultimaCita).getMonth() === new Date().getMonth()
    ).length;

    // Estadísticas por edad
    this.estadisticas.porEdad = {
      '0-17': this.pacientesOriginales.filter(p => p.edad <= 17).length,
      '18-39': this.pacientesOriginales.filter(p => p.edad >= 18 && p.edad <= 39).length,
      '40-64': this.pacientesOriginales.filter(p => p.edad >= 40 && p.edad <= 64).length,
      '65+': this.pacientesOriginales.filter(p => p.edad >= 65).length
    };

    // Estadísticas por género
    this.estadisticas.porGenero = {
      masculino: this.pacientesOriginales.filter(p => p.genero === 'masculino').length,
      femenino: this.pacientesOriginales.filter(p => p.genero === 'femenino').length,
      otro: this.pacientesOriginales.filter(p => p.genero === 'otro').length
    };

    // Diagnósticos frecuentes
    const diagnosticos: { [key: string]: number } = {};
    this.pacientesOriginales.forEach(p => {
      diagnosticos[p.ultimoDiagnostico] = (diagnosticos[p.ultimoDiagnostico] || 0) + 1;
    });

    this.estadisticas.diagnosticosFrecuentes = Object.entries(diagnosticos)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }

  // 🔍 Filtrar pacientes
  filtrarPacientes(): void {
    this.pacientesFiltrados = this.pacientesOriginales.filter(paciente => {
      const cumpleTexto = !this.busquedaTexto || 
        paciente.nombre.toLowerCase().includes(this.busquedaTexto.toLowerCase()) ||
        paciente.documento.includes(this.busquedaTexto) ||
        paciente.telefono.includes(this.busquedaTexto);

      const cumpleEdad = !this.filtroEdad || this.verificarRangoEdad(paciente.edad, this.filtroEdad);

      return cumpleTexto && cumpleEdad;
    });

    this.aplicarOrdenamiento();
  }

  // 🎯 Verificar rango de edad
  private verificarRangoEdad(edad: number, rango: string): boolean {
    switch (rango) {
      case '0-17': return edad <= 17;
      case '18-39': return edad >= 18 && edad <= 39;
      case '40-64': return edad >= 40 && edad <= 64;
      case '65+': return edad >= 65;
      default: return true;
    }
  }

  // 📊 Aplicar ordenamiento
  aplicarOrdenamiento(): void {
    this.pacientesFiltrados.sort((a, b) => {
      switch (this.ordenamiento) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'nombre-desc':
          return b.nombre.localeCompare(a.nombre);
        case 'fecha-desc':
          return new Date(b.ultimaCita).getTime() - new Date(a.ultimaCita).getTime();
        case 'fecha-asc':
          return new Date(a.ultimaCita).getTime() - new Date(b.ultimaCita).getTime();
        case 'edad-asc':
          return a.edad - b.edad;
        case 'edad-desc':
          return b.edad - a.edad;
        default:
          return 0;
      }
    });
  }

  // 🧹 Limpiar filtros
  limpiarFiltros(): void {
    this.busquedaTexto = '';
    this.filtroEdad = '';
    this.ordenamiento = 'nombre';
    this.filtrarPacientes();
  }

  // 👁️ Cambiar vista
  cambiarVista(vista: 'tarjetas' | 'tabla'): void {
    this.vistaActual = vista;
  }

  // ⚡ Acciones de pacientes
  verHistorial(paciente: Paciente): void {
    console.log('Ver historial de:', paciente.nombre);
    // Aquí navegarías al historial del paciente
  }

  nuevaCita(paciente: Paciente): void {
    console.log('Nueva cita para:', paciente.nombre);
    // Aquí abrirías el formulario de nueva cita
  }

  contactarPaciente(paciente: Paciente): void {
    console.log('Contactar a:', paciente.nombre);
    // Aquí mostrarías las opciones de contacto
  }
}





