import { Injectable } from '@angular/core';
import { TipoDocumento } from '../../models/common/tipo-documento';

@Injectable({
    providedIn: 'root'
})

export class TipoDocumentoService {
    static readonly TIPOS_DOCUMENTO: TipoDocumento[] = [
        {
            codigo: 'DNI',
            nombre: 'Documento Nacional de Identidad',
            longitudMinima: 8,
            longitudMaxima: 8,
            patron: '^[0-9]{8}$',
            placeholder: 'Ej: 12345678'
        },
        {
            codigo: 'PASAPORTE',
            nombre: 'Pasaporte',
            longitudMinima: 6,
            longitudMaxima: 9,
            patron: '^[A-Za-z0-9]{6,9}$',
            placeholder: 'Ej: AB123456'
        },
        {
            codigo: 'CE',
            nombre: 'Carné de Extranjería',
            longitudMinima: 9,
            longitudMaxima: 9,
            patron: '^[A-Za-z0-9]{9}$',
            placeholder: 'Ej: 001234567'
        }
    ];

    static getTipoDocumento(codigo: string): TipoDocumento | undefined {
        return this.TIPOS_DOCUMENTO.find(tipo => tipo.codigo === codigo);
    }

    static getTodosLosTipos(): TipoDocumento[] {
        return this.TIPOS_DOCUMENTO;
    }

    static validarDocumento(tipoDocumento: string, numeroDocumento: string): boolean {
        const tipo = this.getTipoDocumento(tipoDocumento);
        if (!tipo) return false;

        const regex = new RegExp(tipo.patron);
        return regex.test(numeroDocumento) &&
            numeroDocumento.length >= tipo.longitudMinima &&
            numeroDocumento.length <= tipo.longitudMaxima;
    }

    static formatearDocumento(tipoDocumento: string, numeroDocumento: string): string {
        if (tipoDocumento === 'DNI' && numeroDocumento.length === 8) {
            return numeroDocumento.replace(/(\d{2})(\d{3})(\d{3})/, '$1,$2,$3');
        }
        return numeroDocumento.toUpperCase();
    }

    static obtenerDescripcionCompleta(tipoDocumento: string, numeroDocumento: string): string {
        const tipo = this.getTipoDocumento(tipoDocumento);
        if (!tipo) return numeroDocumento;

        return `${tipo.codigo}: ${this.formatearDocumento(tipoDocumento, numeroDocumento)}`;
    }

    static getMensajeError(tipoDocumento: string): string {
        const tipo = this.getTipoDocumento(tipoDocumento);
        if (!tipo) return 'Formato de documento incorrecto';

        switch (tipo.codigo) {
            case 'DNI':
                return '8 números (0-9)';
            case 'PASAPORTE':
                return '6-9 caracteres alfanuméricos';
            case 'CE':
                return '9 caracteres alfanuméricos';
            default:
                return 'Formato de documento incorrecto';
        }
    }
}