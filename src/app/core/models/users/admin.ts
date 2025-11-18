import { Persona } from "./persona";
import { Usuario } from "./usuario";

export interface Admin {
    idAdmin: number;
    nombreCompleto: string;

    personaId: number;
    usuarioId: number;
    usuarioAgregoId: number;
    persona: Persona;
    usuario?: Usuario;
    usuarioAgrego?: Usuario;

    cargo: string;
    nivelAcceso: string;
    estado: string;

    createdAt?: string;
    updatedAt?: string;
}
