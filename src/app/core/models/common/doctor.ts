export interface Doctor {
  id: number;
  nombre: string;
  especialidad: string;
  descripcion: string;
  disponibilidad: string[];
  fotoUrl?: string;
}
