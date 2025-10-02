import { Injectable } from '@angular/core';
import { CitaCompleta } from '../models/common/cita';

@Injectable({
    providedIn: 'root'
})
export class CitaService {
    obtenerCitaPorId(id: number): CitaCompleta | undefined {
        return this.obtenerCitas().find(c => c.id === id);
    }

    limpiarCitas(): void {
        localStorage.removeItem(this.storageKey);
    }
    private storageKey = 'citas';

    obtenerCitas(): CitaCompleta[] {
        const citasStr = localStorage.getItem(this.storageKey);
        return citasStr ? JSON.parse(citasStr) : [];
    }

    guardarCita(cita: CitaCompleta): void {
        const citas = this.obtenerCitas();
        if (!cita.id) {
            cita.id = this.generarId();
            cita.fechaCreacion = new Date().toISOString();
        }
        const idx = citas.findIndex(c => c.id === cita.id);
        if (idx > -1) {
            cita.fechaModificacion = new Date().toISOString();
            citas[idx] = cita;
        } else {
            citas.push(cita);
        }
        localStorage.setItem(this.storageKey, JSON.stringify(citas));
    }

    eliminarCita(id: number): void {
        const citas = this.obtenerCitas().filter(c => c.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(citas));
    }

    private generarId(): number {
        const citas = this.obtenerCitas();
        return citas.length ? Math.max(...citas.map(c => c.id)) + 1 : 1;
    }
}
