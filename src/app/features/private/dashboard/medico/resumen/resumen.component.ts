import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { CitaService } from '../../../../../core/services/logic/cita.service';
import { MedicosService } from '../../../../../core/services/logic/medico.service';
import { PacienteService } from '../../../../../core/services/rol/paciente.service';
import { CitaCompleta } from '../../../../../core/models/common/cita';

// 📊 Interfaces para Dashboard Doctor
interface EstadisticaGeneral {
  citasHoy: number;
  citasSemana: number;
  citasMes: number;
  totalPacientes: number;
  pacientesNuevos: number;
  citasPendientes: number;
  citasCompletadas: number;
  horasConsulta: number;
  eficiencia: number;
}

interface CitaResumen {
  id: number;
  hora: string;
  paciente: string;
  tipo: string;
  // estados normalizados usados en UI (se basan en el valor que trae el API)
  estado: 'siguiente' | 'programada' | 'completada' | 'no-show' | 'cancelada' | 'desconocido';
  duracion: number;
}

interface PacienteReciente {
  id: number;
  nombre: string;
  ultimaCita: string;
  proximaCita?: string;
  estado: 'critico' | 'seguimiento' | 'control' | 'nuevo';
  diagnostico: string;
}

interface ActividadReciente {
  id: number;
  tipo: 'cita' | 'diagnostico' | 'tratamiento' | 'nota';
  descripcion: string;
  paciente: string;
  fecha: string;
  hora: string;
}
@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resumen.component.html',
  styleUrl: './resumen.component.css'
})
export class ResumenComponent implements OnInit {
  private authService = inject(AuthService);
  private citasSrv = inject(CitaService);
  private medicosSrv = inject(MedicosService);
  private pacienteSrv = inject(PacienteService);
  private router = inject(Router);
  
  // 👨‍⚕️ Doctor actual
  doctorActual: DoctorVM | null = null;

  // 🗂️ Citas (todas y filtradas por doctor)
  citas: CitaCompleta[] = [];
  citasDoctor: CitaCompleta[] = [];
  
  // 📊 Estadísticas generales
  estadisticas: EstadisticaGeneral = {
    citasHoy: 0,
    citasSemana: 0,
    citasMes: 0,
    totalPacientes: 0,
    pacientesNuevos: 0,
    citasPendientes: 0,
    citasCompletadas: 0,
    horasConsulta: 0,
    eficiencia: 0
  };
  
  // 📅 Citas del día
  citasHoy: CitaResumen[] = [];
  // Todas las citas de hoy (para la vista "Ver todas") ordenadas por proximidad
  citasHoyTodas: CitaResumen[] = [];
  proximaCita: CitaResumen | null = null;
  
  // 👥 Pacientes recientes
  pacientesRecientes: PacienteReciente[] = [];
  // lista de pacientes traída desde el endpoint tablapacientes/medico/:idMedico
  pacientesLista: any[] = [];
  
  // 📄 Actividades recientes
  actividadesRecientes: ActividadReciente[] = [];
  
  // 🕰️ Fecha y hora actual
  fechaActual = new Date();
  horaActual = '';
  // Modal "Ver todas"
  showCitasModal = false;
  
  // 🏆 Métricas de rendimiento
  metricasRendimiento = {
    puntualidad: 95,
    satisfaccionPacientes: 98,
    tiempoPromedioCita: 32,
    derivacionesEfectivas: 87
  };

  ngOnInit(): void {
    this.obtenerDoctorActual();
    this.actualizarHora();
    this.cargarDatos();
    
    // Actualizar hora cada minuto
    setInterval(() => {
      this.actualizarHora();
      this.refreshProximaFromTodas();
    }, 60000);
  }

  // Re-evalúa la próxima cita a partir de `citasHoyTodas` (llamable periódicamente)
  private refreshProximaFromTodas(): void {
    try {
      if (!this.citasHoyTodas || this.citasHoyTodas.length === 0) {
        this.proximaCita = null;
        this.citasHoy = [];
        return;
      }
      const ahora = new Date();
      // Buscar la primera cita cuyo datetime sea >= ahora
      const proxima = this.citasHoyTodas.find(c => {
        const dt = this.buildDateTime(this.fechaISO(new Date()), c.hora);
        return dt >= ahora && !this.esCompletada(c.estado);
      });
      if (proxima) {
        this.proximaCita = proxima;
        this.citasHoy = [proxima];
      } else {
        this.proximaCita = null;
        this.citasHoy = [];
      }
    } catch (e) {
      console.warn('Error recalculando próxima cita:', e);
    }
  }
  
  // 👨‍⚕️ Obtener doctor logueado
  private obtenerDoctorActual(): void {
    const user: any = this.authService.currentUser;
    if (!user) return;
    const p = user.persona || {};
    const correo = user.correo || '';
    const especialidadLS = localStorage.getItem(`medico_especialidad:${correo}`) || undefined;

    // inicializar con datos del usuario como fallback
    this.doctorActual = {
      id: user.idUsuario || 0,
      nombre: `${p.nombre1 || ''}`.trim(),
      apellidoPaterno: p.apellidoPaterno || '',
      correo,
      especialidad: especialidadLS
    };

    // Intentar obtener datos reales desde el backend (medico -> perfil)
    const idUsuario = user.idUsuario || 0;
    if (!idUsuario) {
      console.log('👨‍⚕️ Doctor en resumen (fallback):', this.doctorActual);
      return;
    }

    this.medicosSrv.obtenerMedicoPorUsuario(idUsuario).subscribe({
      next: (medResp: any) => {
        console.log('DEBUG: obtenerMedicoPorUsuario respuesta:', medResp);
        const idMedico = medResp?.id_medico || medResp?.idMedico || medResp?.id || medResp?.medicoId || 0;
        console.log('DEBUG: idMedico resuelto:', idMedico);
        // si la respuesta incluye especialidad la usamos
        if (medResp?.especialidad) {
          this.doctorActual!.especialidad = medResp.especialidad;
        }

        if (idMedico) {
          this.medicosSrv.obtenerPerfilMedico(idMedico).subscribe({
            next: (perfilResp: any) => {
              const perfil = Array.isArray(perfilResp) ? perfilResp[0] : perfilResp || {};
              // usar nombre1 del backend (primer nombre)
              if (perfil?.nombre1) this.doctorActual!.nombre = perfil.nombre1;
              if (perfil?.apellidoPaterno) this.doctorActual!.apellidoPaterno = perfil.apellidoPaterno;
              if (perfil?.especialidad) this.doctorActual!.especialidad = perfil.especialidad;
              console.log('👨‍⚕️ Doctor en resumen (desde API):', this.doctorActual);
            },
            error: (err: any) => {
              console.warn('No se pudo obtener perfil del médico, usando fallback:', err);
              console.log('👨‍⚕️ Doctor en resumen (fallback):', this.doctorActual);
            }
          });

          // Obtener la lista de pacientes (formato tabla) para este médico
          this.pacienteSrv.obtenerPacientesPorMedico(idMedico).subscribe({
            next: (lista: any[]) => {
              const total = Array.isArray(lista) ? lista.length : 0;
              this.estadisticas.totalPacientes = total;
              // normalizar algunos campos para facilitar matching
              this.pacientesLista = Array.isArray(lista) ? lista.map((p: any) => ({
                ...p,
                _emailNormalized: (p.email || p.correo || p.pacienteEmail || '').toString().toLowerCase(),
                _nombreNormalized: (p.nombreCompleto || `${p.nombre || ''} ${p.apellidoPaterno || ''}`.trim()).toString().toLowerCase()
              })) : [];
              console.log(`Total pacientes (medico ${idMedico}):`, total, 'pacientesLista:', this.pacientesLista.length);
              // reconstruir pacientes recientes usando datos del backend
              this.cargarPacientesRecientes();
            },
            error: (e: any) => {
              console.warn('No se pudo obtener pacientes por médico:', e);
            }
          });

          // Obtener puntualidad desde endpoint específico y actualizar métricas
          this.pacienteSrv.obtenerPuntualidadPorMedico(idMedico).subscribe({
            next: (res: any) => {
              try {
                let p = typeof res === 'number' ? res : (res && res.puntualidad !== undefined ? res.puntualidad : null);
                if (p === null || p === undefined) return;
                // Si la API devuelve 0..1 convertimos a porcentaje
                if (p <= 1) p = Math.round(p * 100);
                else p = Math.round(p);
                this.metricasRendimiento.puntualidad = p;
                console.log('DEBUG: puntualidad obtenida:', res, 'usada como %:', p);
              } catch (err) {
                console.warn('Error procesando puntualidad:', err);
              }
            },
            error: (err: any) => {
              console.warn('No se pudo obtener puntualidad por médico:', err);
            }
          });
          // Obtener satisfacción desde endpoint específico y actualizar métricas
          this.pacienteSrv.obtenerSatisfaccionPorMedico(idMedico).subscribe({
            next: (res: any) => {
              try {
                let s = typeof res === 'number' ? res : (res && res.satisfaccion !== undefined ? res.satisfaccion : null);
                if (s === null || s === undefined) return;
                // Si la API devuelve 0..1 convertimos a porcentaje
                if (s <= 1) s = Math.round(s * 100);
                else s = Math.round(s);
                this.metricasRendimiento.satisfaccionPacientes = s;
                console.log('DEBUG: satisfaccion obtenida:', res, 'usada como %:', s);
              } catch (err) {
                console.warn('Error procesando satisfaccion:', err);
              }
            },
            error: (err: any) => {
              console.warn('No se pudo obtener satisfaccion por médico:', err);
            }
          });
          // Obtener horas totales y promedio desde el backend y usar en la UI
          this.citasSrv.obtenerHorasPromedioPorMedico(idMedico).subscribe({
            next: (res: any) => {
              try {
                const ht = res && res.horasTotales !== undefined ? res.horasTotales : (res && res.horasTotales === 0 ? 0 : null);
                const pm = res && res.promedioMinutos !== undefined ? res.promedioMinutos : (res && res.promedioMinutos === 0 ? 0 : null);
                if (ht !== null && ht !== undefined) {
                  // guardar horas totales en estadisticas (en horas, con un decimal)
                  this.estadisticas.horasConsulta = Math.round(ht * 10) / 10;
                }
                if (pm !== null && pm !== undefined) {
                  // promedio en minutos
                  this.metricasRendimiento.tiempoPromedioCita = Math.round(pm);
                }
                console.log('DEBUG: horasPromedio obtenidas:', res, 'estadisticas.horasConsulta:', this.estadisticas.horasConsulta, 'promedioMinutos:', this.metricasRendimiento.tiempoPromedioCita);
              } catch (err) {
                console.warn('Error procesando horas/promedio:', err);
              }
            },
            error: (err: any) => {
              console.warn('No se pudo obtener horas/promedio por médico:', err);
            }
          });

          // Obtener citas para el dashboard desde el backend y actualizar el cuadro "Citas Hoy"
          // Obtener citas desde backend para este médico y guardarlas en `citasDoctor`
          this.citasSrv.obtenerCitasDashboardPorMedico(idMedico).subscribe({
            next: (lista: any[]) => {
              console.log('DEBUG: obtenerCitasDashboardPorMedico respuesta cruda:', lista);
              const todas = Array.isArray(lista) ? lista : [];
              // Guardar todas las citas en citasDoctor para poder usar fechas al ordenar pacientes
              this.citasDoctor = todas.map((c: any) => ({
                id: c.id,
                pacienteNombre: c.paciente || c.pacienteNombre || c.nombreCompleto || '',
                doctorNombre: c.doctorNombre || '',
                especialidad: c.especialidad || '',
                // Conservar subespecialidad que venga desde el API
                subespecialidad: c.subespecialidad || c.subespecialidadNombre || undefined,
                // Normalizar: si el API devuelve datetime en `fecha` y `hora` viene vacío,
                // extraer la parte fecha (YYYY-MM-DD) y la hora (HH:MM) para evitar que
                // las comparaciones por hoy/futuro fallen.
                fecha: (function(rawFecha){
                  if(!rawFecha) return '';
                  return rawFecha.toString().split('T')[0].split(' ')[0];
                })(c.fecha),
                hora: (function(rawFecha, rawHora){
                  const h = (rawHora || '').toString().trim();
                  if(h) return h.slice(0,5);
                  if(!rawFecha) return '';
                  const parts = rawFecha.toString().split('T');
                  if(parts.length > 1) return parts[1].slice(0,5);
                  const parts2 = rawFecha.toString().split(' ');
                  if(parts2.length > 1) return parts2[1].slice(0,5);
                  return '';
                })(c.fecha, c.hora),
                estado: c.estado,
                pacienteEmail: c.pacienteEmail || '',
                pacienteTelefono: c.pacienteTelefono || '',
                tipoConsulta: c.tipoConsulta || c.tipo || '',
                motivoConsulta: c.motivoConsulta || '',
                fechaCreacion: c.fechaCreacion || '',
                duracionEstimada: c.duracionEstimada || 30
              } as CitaCompleta));
              console.log('DEBUG: citasDoctor normalizadas (primeros 10):', this.citasDoctor.slice(0,10));

              // También derivar las vistas/estadísticas de hoy como antes
              const hoy = this.fechaISO(new Date());
              console.log('DEBUG: hoy (fechaISO):', hoy);
              console.log('DEBUG: citas recibidas (fecha/hora muestra):', this.citasDoctor.map(x=>({id: x.id, fecha: x.fecha, hora: x.hora, estado: x.estado})).slice(0,20));
              const citasHoyApi = this.citasDoctor.filter(i => i && ((i.fecha === hoy) || (typeof i.fecha === 'string' && i.fecha.startsWith(hoy))));
              console.log('DEBUG: citasHoyApi detectadas:', citasHoyApi.length, citasHoyApi.map(x=>({id: x.id, fecha: x.fecha, hora: x.hora, estado: x.estado})));
              const totalHoy = citasHoyApi.length;
              const completadas = citasHoyApi.filter(i => (i.estado || '').toString().toLowerCase().includes('complet')).length;
              this.estadisticas.citasHoy = totalHoy;
              this.estadisticas.citasCompletadas = completadas;

              // Mapear citasHoy para la UI reducida
              const estadoOrder = (s: any) => {
                const st = (s || '').toString().toLowerCase();
                if (st.includes('program')) return 0;
                if (st.includes('pend') || st.includes('confirm')) return 1;
                if (st.includes('complet')) return 2;
                return 3;
              };
              const hoyStr = hoy;
              const mappedAll: Array<{ original: CitaResumen; dt: Date }> = citasHoyApi.map((c: any, idx: number) => {
                const horaStr = (c.hora || '').toString().slice(0,5);
                const item: CitaResumen = {
                  id: c.id || idx + 1,
                  hora: horaStr,
                  paciente: c.paciente || c.pacienteNombre || c.nombreCompleto || '',
                  // Preferir `subespecialidad` si el API la devuelve
                  tipo: (c.subespecialidad || c.tipoConsulta || c.tipo || c.descripcion || ''),
                  estado: this.normalizeEstadoFromApi(c.estado),
                  duracion: c.duracionEstimada || 30
                };
                return { original: item, dt: this.buildDateTime(hoyStr, horaStr) };
              });

              // Obtener historial/actividades recientes desde el endpoint de historial
              this.citasSrv.obtenerHistorialCitasPorMedico(idMedico).subscribe({
                next: (hist: any[]) => {
                  try {
                    const lista = Array.isArray(hist) ? hist : [];
                    // Ordenar por fechaEvento descendente y limitar a 6
                    lista.sort((a: any, b: any) => {
                      const da = new Date((a.fechaEvento || '').replace(' ', 'T'));
                      const db = new Date((b.fechaEvento || '').replace(' ', 'T'));
                      return db.getTime() - da.getTime();
                    });
                    this.actividadesRecientes = lista.slice(0, 6).map((h: any, idx: number) => {
                      // fechaEvento viene como "YYYY-MM-DD HH:MM:SS.xxxxxx"
                      const raw = h.fechaEvento || '';
                      const parts = raw.split(' ');
                      const fecha = parts[0] || '';
                      const hora = (parts[1] || '').slice(0,5);
                      return {
                        id: h.id_historial_cita || h.id || idx + 1,
                        tipo: 'cita',
                        descripcion: h.detalle || '',
                        paciente: this.nombreCorto(h.paciente || ''),
                        fecha,
                        hora
                      } as ActividadReciente;
                    });
                  } catch (e) {
                    console.warn('Error mapeando historial de citas:', e);
                  }
                },
                error: (err: any) => {
                  console.warn('No se pudo obtener historial de citas por médico:', err);
                }
              });
              mappedAll.sort((a: any, b: any) => {
                const ea = estadoOrder(a.original.estado);
                const eb = estadoOrder(b.original.estado);
                if (ea !== eb) return ea - eb;
                return a.dt.getTime() - b.dt.getTime();
              });
              const ahora2 = new Date();
              const futuros = mappedAll.filter(x => x.dt >= ahora2).map(x=>x.original);
              const pasados = mappedAll.filter(x => x.dt < ahora2).sort((a,b)=>b.dt.getTime()-a.dt.getTime()).map(x=>x.original);
              this.citasHoyTodas = [...futuros, ...pasados];
              console.log('DEBUG: mappedAll (dt/hora):', mappedAll.map(m=>({hora: m.original.hora, dt: m.dt.toISOString(), estado: m.original.estado, paciente: m.original.paciente})));
              console.log('DEBUG: futuros/pasados counts:', {futuros: futuros.length, pasados: pasados.length});
              console.log('DEBUG: citasHoyTodas:', this.citasHoyTodas);
              const siguiente = futuros.length > 0 ? futuros[0] : null;
              if (siguiente) {
                // Si el siguiente viene del API como 'programada' u otro estado,
                // forzamos en la UI que se muestre como 'siguiente' (badge "Siguiente").
                const marcada = { ...siguiente, estado: 'siguiente' as CitaResumen['estado'] };
                this.proximaCita = marcada;
                this.citasHoy = [marcada];
              } else {
                this.proximaCita = this.proximaCita || null;
                this.citasHoy = [];
              }
              console.log('DEBUG: proximaCita final:', this.proximaCita, 'citasHoy (UI):', this.citasHoy);

              // Reconstruir pacientes recientes ahora que tenemos citasDoctor
              this.cargarPacientesRecientes();
            },
            error: (err: any) => {
              console.warn('No se pudo obtener citas dashboard por médico:', err);
            }
          });
        } else {
          console.log('👨‍⚕️ Doctor en resumen (sin idMedico):', this.doctorActual);
        }
      },
      error: (err: any) => {
        console.warn('Error obteniendo medico por usuario, usando fallback:', err);
        console.log('👨‍⚕️ Doctor en resumen (fallback):', this.doctorActual);
      }
    });
  }

  // 📥 Cargar data base para el dashboard
  private cargarDatos(): void {
    // Obtener todas las citas
    // Seed si no hay citas para mostrar demo coherente
    if (this.doctorActual) {
      const nombreDoctor = `${this.doctorActual.nombre} ${this.doctorActual.apellidoPaterno || ''}`.trim();
      this.citasSrv.seedIfEmptyForDoctor(nombreDoctor, this.doctorActual.especialidad);
    }
    this.citas = this.citasSrv.obtenerCitas();
    // Filtrar a las del doctor actual (por especialidad o nombre del médico)
    this.citasDoctor = this.filtrarCitasPorDoctor(this.citas);

    // Derivar tarjetas/estadísticas y secciones
    this.cargarEstadisticas();
    this.cargarCitasHoy();
    this.cargarPacientesRecientes();
    this.cargarActividadesRecientes();
  }

  private filtrarCitasPorDoctor(citas: CitaCompleta[]): CitaCompleta[] {
    if (!this.doctorActual) return citas;
    const nombreDoctor = `${this.doctorActual.nombre} ${this.doctorActual.apellidoPaterno || ''}`.trim().toLowerCase();
    const esp = (this.doctorActual.especialidad || '').toLowerCase();
    return citas.filter(c => {
      const byEsp = esp ? (c.especialidad || '').toLowerCase() === esp : false;
      const byNombre = c.doctorNombre ? c.doctorNombre.toLowerCase() === nombreDoctor : false;
      return byEsp || byNombre;
    });
  }
  
  // 🕰️ Actualizar hora actual
  private actualizarHora(): void {
    this.fechaActual = new Date();
    this.horaActual = this.fechaActual.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // 📊 Cargar estadísticas generales (dinámico)
  private cargarEstadisticas(): void {
    const hoy = this.fechaISO(new Date());
    const ahora = new Date();

    const enSemana = this.rangoSemanaActual();
    const enMes = this.rangoMesActual();

    const citasHoy = this.citasDoctor.filter(c => (c.fecha || '').toString().startsWith(hoy));
    const citasSemana = this.citasDoctor.filter(c => this.enRangoFecha(c.fecha, enSemana.inicio, enSemana.fin));
    const citasMes = this.citasDoctor.filter(c => this.enRangoFecha(c.fecha, enMes.inicio, enMes.fin));

    const pendientes = this.citasDoctor.filter(c => this.esProgramada(c.estado));
    const completadas = this.citasDoctor.filter(c => this.esCompletada(c.estado));

    // Pacientes únicos por email
    const pacientesUnicos = new Set(this.citasDoctor.map(c => c.pacienteEmail).filter(Boolean));

    // Pacientes nuevos del mes: primera cita del paciente en este mes
    const pacientesNuevos = this.calcularPacientesNuevosDelMes(this.citasDoctor, enMes.inicio, enMes.fin);

    const horasConsulta = citasHoy.reduce((acc, c) => acc + (c.duracionEstimada || 30), 0) / 60;
    const totalConsideradas = pendientes.length + completadas.length;
    const eficiencia = totalConsideradas > 0 ? Math.round((completadas.length / totalConsideradas) * 100) : 94;

    this.estadisticas = {
      citasHoy: citasHoy.length,
      citasSemana: citasSemana.length,
      citasMes: citasMes.length,
      totalPacientes: pacientesUnicos.size,
      pacientesNuevos,
      citasPendientes: pendientes.length,
      citasCompletadas: completadas.length,
      horasConsulta: Math.round(horasConsulta * 10) / 10,
      eficiencia
    };
  }
  
  // 📅 Cargar citas del día (dinámico)
  private cargarCitasHoy(): void {
    const hoy = this.fechaISO(new Date());
    const ahora = new Date();
    const citasHoy = this.citasDoctor
      .filter(c => (c.fecha || '').toString().startsWith(hoy))
      .sort((a, b) => this.buildDateTime(a.fecha, a.hora).getTime() - this.buildDateTime(b.fecha, b.hora).getTime());

    // Determinar próxima cita (primera programada con hora >= ahora)
    const proxima = citasHoy.find(c => this.esEstadoAtencion(c.estado) && this.buildDateTime(c.fecha, c.hora) >= ahora) || null;
    this.proximaCita = proxima ? this.mapCitaResumen(proxima, 'siguiente') : null;

    // Mapear todas las citas del día
    this.citasHoy = citasHoy.map(c => {
      const estadoResumen: CitaResumen['estado'] = this.normalizeEstadoFromApi(c.estado);
      // Marcar la próxima como 'siguiente'
      if (proxima && c.id === proxima.id) return this.mapCitaResumen(c, 'siguiente');
      return this.mapCitaResumen(c, estadoResumen);
    });
  }
  
  // 👥 Cargar pacientes recientes (dinámico)
  private cargarPacientesRecientes(): void {
    const items: PacienteReciente[] = [];

    // Si tenemos lista de pacientes desde la API, priorizamos esa lista y calculamos
    // la última cita de cada paciente buscando en `citasDoctor`.
    if (this.pacientesLista && this.pacientesLista.length > 0) {
      for (const p of this.pacientesLista) {
        const keyEmail = (p._emailNormalized || p.email || p.correo || p.pacienteEmail || '').toString().toLowerCase();
        const keyName = (p._nombreNormalized || p.nombreCompleto || `${p.nombre || ''} ${p.apellidoPaterno || ''}`.trim()).toString().toLowerCase();

        const citasPaciente = this.citasDoctor.filter(c => {
          const em = (c.pacienteEmail || '').toString().toLowerCase();
          const nm = (c.pacienteNombre || '').toString().toLowerCase();
          const matchEmail = keyEmail && (em === keyEmail || em.includes(keyEmail) || keyEmail.includes(em));
          const matchName = keyName && (nm === keyName || nm.includes(keyName) || keyName.includes(nm));
          return !!(matchEmail || matchName);
        }).sort((a, b) => this.buildDateTime(b.fecha, b.hora).getTime() - this.buildDateTime(a.fecha, a.hora).getTime());

        const ultima = citasPaciente.length > 0 ? citasPaciente[0] : null;
        const visitas = citasPaciente.length;
        const estado: PacienteReciente['estado'] = visitas === 0 ? 'nuevo' : (visitas === 1 ? 'nuevo' : (visitas >= 3 ? 'seguimiento' : 'control'));

        items.push({
          id: Math.abs(this.hashCode(keyEmail || keyName || String(items.length + 1))),
          nombre: this.nombreCorto((ultima && ultima.pacienteNombre) || keyName || (p.nombre || 'Paciente')),
          ultimaCita: ultima ? ultima.fecha : '',
          proximaCita: citasPaciente.find(c => this.esProgramada(c.estado))?.fecha,
          estado,
          // Mostrar subespecialidad si está presente en la última cita
          diagnostico: (ultima && ((ultima as any).subespecialidad || ultima.tipoConsulta)) || p.ultimoDiagnostico || this.obtenerDiagnosticoPorEspecialidad(this.doctorActual?.especialidad || '')
        });
      }
    } else {
      // Fallback: agrupar por citasDoctor (cuando no hay lista del backend disponible)
      const porPaciente = new Map<string, CitaCompleta[]>();
      for (const c of this.citasDoctor) {
        const key = c.pacienteEmail || c.pacienteNombre;
        if (!porPaciente.has(key)) porPaciente.set(key, []);
        porPaciente.get(key)!.push(c);
      }
      porPaciente.forEach((lista, key) => {
        lista.sort((a, b) => this.buildDateTime(b.fecha, b.hora).getTime() - this.buildDateTime(a.fecha, a.hora).getTime());
        const ultima = lista[0];
        const proxima = lista.find(c => this.esProgramada(c.estado));
        const visitas = lista.length;
        const estado: PacienteReciente['estado'] = visitas === 1 ? 'nuevo' : (visitas >= 3 ? 'seguimiento' : 'control');
        items.push({
          id: Math.abs(this.hashCode(key)),
          nombre: this.nombreCorto(ultima.pacienteNombre),
          ultimaCita: ultima.fecha,
          proximaCita: proxima?.fecha,
          estado,
          diagnostico: (ultima as any).subespecialidad || ultima.tipoConsulta
        });
      });
    }

    // Ordenar por última cita (más reciente primero). Pacientes sin fecha van al final.
    this.pacientesRecientes = items
      .sort((a, b) => {
        const ta = a.ultimaCita ? new Date(a.ultimaCita).getTime() : 0;
        const tb = b.ultimaCita ? new Date(b.ultimaCita).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 4);

    console.log('Pacientes recientes calculados:', this.pacientesRecientes.map(p => ({nombre: p.nombre, ultimaCita: p.ultimaCita})));
  }
  
  // 📄 Cargar actividades recientes (dinámico)
  private cargarActividadesRecientes(): void {
    const recientes = [...this.citasDoctor]
      .sort((a, b) => this.buildDateTime(b.fecha, b.hora).getTime() - this.buildDateTime(a.fecha, a.hora).getTime())
      .slice(0, 6);
    this.actividadesRecientes = recientes.map((c, idx) => ({
      id: c.id || idx + 1,
      tipo: 'cita',
      descripcion: `Cita ${c.estado}`,
      paciente: this.nombreCorto(c.pacienteNombre),
      fecha: c.fecha,
      hora: c.hora
    }));
  }
  
  /*
  // 🏅 Métodos auxiliares para especialidades
  private generarCitasDelDia(especialidad: string): number {
    const citasPorEspecialidad: { [key: string]: number } = {
      'Cardiología': 8,
      'Medicina General': 12,
      'Pediatría': 15,
      'Dermatología': 10,
      'Neurología': 6
    };
    return citasPorEspecialidad[especialidad] || 10;
  }
  
  private calcularPacientesPorEspecialidad(especialidad: string): number {
    const pacientesPorEspecialidad: { [key: string]: number } = {
      'Cardiología': 245,
      'Medicina General': 380,
      'Pediatría': 420,
      'Dermatología': 180,
      'Neurología': 125
    };
    return pacientesPorEspecialidad[especialidad] || 200;
  }
  
  private obtenerTipoConsultaPorEspecialidad(especialidad: string): string {
    const tiposPorEspecialidad: { [key: string]: string[] } = {
      'Cardiología': ['Control Cardiológico', 'Electrocardiograma', 'Ecocardiograma', 'Consulta Urgente'],
      'Medicina General': ['Consulta General', 'Control de Cronicós', 'Chequeo Preventivo', 'Consulta Aguda'],
      'Pediatría': ['Control Niño Sano', 'Vacunación', 'Consulta Pediátrica', 'Urgencia Pediátrica'],
      'Dermatología': ['Consulta Dermatológica', 'Control de Lunares', 'Tratamiento Acné', 'Dermatoscopia'],
      'Neurología': ['Consulta Neurológica', 'Control Epilepsia', 'Evaluación Cognitiva', 'Electroencefalograma']
    };
    const tipos = tiposPorEspecialidad[especialidad] || ['Consulta General'];
    return tipos[Math.floor(Math.random() * tipos.length)];
  }
  */
  private obtenerDiagnosticoPorEspecialidad(especialidad: string): string {
    const diagnosticosPorEspecialidad: { [key: string]: string[] } = {
      'Cardiología': ['Hipertensión Arterial', 'Arritmia Cardíaca', 'Insuficiencia Cardíaca', 'Angina de Pecho'],
      'Medicina General': ['Diabetes Mellitus', 'Hipertensión', 'Dislipidemia', 'Síndrome Metabólico'],
      'Pediatría': ['Desarrollo Normal', 'Infección Respiratoria', 'Gastroenteritis', 'Alergia Alimentaria'],
      'Dermatología': ['Dermatitis Atópica', 'Acné Vulgar', 'Psoriasis', 'Melanoma'],
      'Neurología': ['Migraña', 'Epilepsia', 'Neuropatía', 'Esclerosis Múltiple']
    };
    const diagnosticos = diagnosticosPorEspecialidad[especialidad] || ['Diagnóstico General'];
    return diagnosticos[Math.floor(Math.random() * diagnosticos.length)];
  }
  
  // 🚀 Acciones rápidas
  iniciarSiguienteCita(): void {
    if (this.proximaCita) {
      alert(`Iniciando cita con ${this.proximaCita.paciente} a las ${this.proximaCita.hora}`);
    } else {
      alert('No hay próxima cita programada');
    }
  }
  
  verTodasLasCitas(): void {
    // Abrir modal con todas las citas de hoy
    this.showCitasModal = true;
    console.log('Abriendo modal de todas las citas (hoy)');
  }

  cerrarModal(): void {
    this.showCitasModal = false;
  }
  
  verTodosLosPacientes(): void {
    // Navegar al listado completo de pacientes del médico
    try {
      this.router.navigate(['/medico/pacientes']);
    } catch (e) {
      console.log('Navegando a todos los pacientes... (fallback)', e);
    }
  }
  
  // 📅 Utilidades de fecha
  obtenerFechaFormateada(): string {
    return this.fechaActual.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  obtenerSaludoSegunHora(): string {
    const hora = this.fechaActual.getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }
}

// Tipos/Utilidades locales
interface DoctorVM {
  id: number;
  nombre: string;
  apellidoPaterno?: string;
  correo: string;
  especialidad?: string;
}

// Helpers
function pad2(n: number): string { return n.toString().padStart(2, '0'); }

// Nota: Los siguientes métodos se anexan a la clase para mantener el estilo del componente.
export interface ResumenComponent {
  fechaISO(d: Date): string;
  buildDateTime(fecha: string, hora: string): Date;
  enRangoFecha(fecha: string, ini: Date, fin: Date): boolean;
  rangoSemanaActual(): { inicio: Date; fin: Date };
  rangoMesActual(): { inicio: Date; fin: Date };
  calcularPacientesNuevosDelMes(citas: CitaCompleta[], ini: Date, fin: Date): number;
  mapCitaResumen(c: CitaCompleta, estado: 'siguiente' | 'programada' | 'completada' | 'no-show' | 'cancelada' | 'desconocido'): CitaResumen;
  nombreCorto(nombre: string): string;
  hashCode(s: string): number;
  normalizeEstadoFromApi(s: any): CitaResumen['estado'];
  esCompletada(s: any): boolean;
  esProgramada(s: any): boolean;
  esCancelada(s: any): boolean;
  esNoShow(s: any): boolean;
  esEstadoAtencion(s: any): boolean;
}

ResumenComponent.prototype.fechaISO = function(d: Date): string {
  // Usar la fecha local en formato YYYY-MM-DD en lugar de toISOString (UTC),
  // porque toISOString puede cambiar el día según la zona horaria del navegador.
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

ResumenComponent.prototype.buildDateTime = function(fecha: string, hora: string): Date {
  const [h, m] = (hora || '00:00').split(':').map(Number);
  const dt = new Date(`${fecha}T${pad2(h)}:${pad2(m)}:00`);
  return dt;
};

ResumenComponent.prototype.enRangoFecha = function(fecha: string, ini: Date, fin: Date): boolean {
  const f = new Date(fecha + 'T00:00:00');
  return f >= new Date(ini.toDateString()) && f <= new Date(fin.toDateString());
};

ResumenComponent.prototype.rangoSemanaActual = function(): { inicio: Date; fin: Date } {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0 domingo ... 6 sábado
  const diffLunes = (dia === 0 ? -6 : 1) - dia; // mover a lunes
  const inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() + diffLunes);
  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  return { inicio, fin };
};

ResumenComponent.prototype.rangoMesActual = function(): { inicio: Date; fin: Date } {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  return { inicio, fin };
};

ResumenComponent.prototype.calcularPacientesNuevosDelMes = function(citas: CitaCompleta[], ini: Date, fin: Date): number {
  const primerCitaPorPaciente = new Map<string, string>();
  for (const c of citas) {
    const key = c.pacienteEmail || c.pacienteNombre;
    const actual = primerCitaPorPaciente.get(key);
    if (!actual || new Date(c.fecha) < new Date(actual)) {
      primerCitaPorPaciente.set(key, c.fecha);
    }
  }
  let nuevos = 0;
  primerCitaPorPaciente.forEach(fecha => {
    if (this.enRangoFecha(fecha, ini, fin)) nuevos++;
  });
  return nuevos;
};

ResumenComponent.prototype.mapCitaResumen = function(c: CitaCompleta, estado: 'siguiente' | 'programada' | 'completada' | 'no-show' | 'cancelada' | 'desconocido'): CitaResumen {
  const tipoVisible = (c as any).subespecialidad || c.tipoConsulta || (c as any).tipo || '';
  return {
    id: c.id,
    hora: c.hora,
    paciente: this.nombreCorto(c.pacienteNombre),
    tipo: tipoVisible,
    estado,
    duracion: c.duracionEstimada || 30
  };
};

ResumenComponent.prototype.nombreCorto = function(nombre: string): string {
  const partes = (nombre || '').split(' ');
  if (partes.length >= 2) {
    return `${partes[0]} ${partes[1].charAt(0)}.`;
  }
  return nombre || '';
};

ResumenComponent.prototype.hashCode = function(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return h;
};

// Normalizadores y helpers de estado (basados en el valor que trae el API)
ResumenComponent.prototype.normalizeEstadoFromApi = function(s: any): CitaResumen['estado'] {
  const st = (s || '').toString().toLowerCase();
  if (!st) return 'desconocido';
  if (st.indexOf('complet') !== -1) return 'completada';
  if (st.indexOf('no') !== -1 && st.indexOf('show') !== -1) return 'no-show';
  if (st.indexOf('noshow') !== -1) return 'no-show';
  if (st.indexOf('no-show') !== -1) return 'no-show';
  if (st.indexOf('cancel') !== -1) return 'cancelada';
  if (st.indexOf('prog') !== -1 || st.indexOf('program') !== -1) return 'programada';
  if (st.indexOf('pend') !== -1 || st.indexOf('confirm') !== -1) return 'programada';
  return 'desconocido';
};

ResumenComponent.prototype.esCompletada = function(s: any): boolean {
  return this.normalizeEstadoFromApi(s) === 'completada';
};

ResumenComponent.prototype.esProgramada = function(s: any): boolean {
  return this.normalizeEstadoFromApi(s) === 'programada';
};

ResumenComponent.prototype.esCancelada = function(s: any): boolean {
  return this.normalizeEstadoFromApi(s) === 'cancelada';
};

ResumenComponent.prototype.esNoShow = function(s: any): boolean {
  return this.normalizeEstadoFromApi(s) === 'no-show';
};

ResumenComponent.prototype.esEstadoAtencion = function(s: any): boolean {
  // true si la cita está activa/por atender (no completada, no cancelada, no-show)
  const norm = this.normalizeEstadoFromApi(s);
  return norm !== 'completada' && norm !== 'cancelada' && norm !== 'no-show';
};
