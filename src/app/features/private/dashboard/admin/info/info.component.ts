import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { CitaService } from '../../../../../core/services/logic/cita.service';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {
  private auth = inject(AuthService) as any;
  private citasSrv = inject(CitaService) as any;

  nombre = '';
  correo = '';
  rol = '';

  totalCitas = 0;
  totalMedicos = 0;
  totalPacientes = 0;

  editando = false;
  editablePersona: any = {};

  ngOnInit(): void {
  const user: any = this.auth.currentUser;
    if (user) {
      const p = user.persona || {};
      this.nombre = `${p.nombre1 || ''} ${p.apellidoPaterno || ''}`.trim();
      this.correo = user.correo || '';
      this.rol = (user.rol && (user.rol.nombre || String(user.rol))) || (user.rolDescripcion || 'Administrador');
      this.editablePersona = structuredClone(p) || {};
      this.editablePersona.email = this.correo;
    } else {
      this.editablePersona = this.editablePersona || {};
    }

    try {
  const citas = (this.citasSrv.obtenerCitas && this.citasSrv.obtenerCitas()) || [];
      this.totalCitas = citas.length;
      const pacientes = new Set(citas.map((c: any) => c.pacienteEmail || c.pacienteNombre));
      this.totalPacientes = pacientes.size;
    } catch (e) {
      this.totalCitas = 0;
      this.totalPacientes = 0;
    }

    let med = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || '';
      if (k.startsWith('medico_especialidad:')) med++;
    }
    this.totalMedicos = med;
  }

  editar(): void {
    this.editablePersona = structuredClone(this.auth.currentUser?.persona || {});
    this.editando = true;
  }

  cancelar(): void {
    this.editablePersona = structuredClone(this.auth.currentUser?.persona || {}) || {};
    this.editando = false;
  }

  guardar(): void {
    if (!this.editablePersona) return;
    try {
      const patch: any = { persona: this.editablePersona };
      const correo = this.auth.currentUser?.correo;
      if (correo) patch.correo = correo;
      this.auth.updateUser(patch);
      this.nombre = `${this.editablePersona.nombre1 || ''} ${this.editablePersona.apellidoPaterno || ''}`.trim();
      this.cancelar();
    } catch (e) {
      console.error('Error guardando perfil admin', e);
    }
  }
}
