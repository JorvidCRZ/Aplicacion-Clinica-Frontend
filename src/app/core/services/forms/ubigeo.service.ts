import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Departamento {
    codigo: string;
    nombre: string;
}

export interface Provincia {
    codigo: string;
    nombre: string;
    departamentoCodigo: string;
}

export interface Distrito {
    codigo: string;
    nombre: string;
    provinciaCodigo: string;
}

@Injectable({
    providedIn: 'root'
})
export class UbigeoService {
    private url = 'https://free.e-api.net.pe/ubigeos.json';
    private data: any;

    constructor(private http: HttpClient) { }

    cargarUbigeos(): Observable<any> {
        if (this.data) {
            return new Observable(observer => observer.next(this.data));
        }
        return this.http.get<any>(this.url).pipe(
            map(res => {
                const departamentos: Departamento[] = [];
                const provincias: Provincia[] = [];
                const distritos: Distrito[] = [];

                for (let depName in res) {
                    const depCodigo = depName;
                    departamentos.push({ nombre: depName, codigo: depCodigo });

                    for (let provName in res[depName]) {
                        const provCodigo = provName;
                        provincias.push({ nombre: provName, codigo: provCodigo, departamentoCodigo: depCodigo });

                        for (let distName in res[depName][provName]) {
                            const dist = res[depName][provName][distName];
                            distritos.push({
                                nombre: distName,
                                codigo: dist.ubigeo,
                                provinciaCodigo: provCodigo
                            });
                        }
                    }
                }

                this.data = { departamentos, provincias, distritos };
                return this.data;
            })
        );
    }

    getDepartamentos(): Observable<Departamento[]> {
        return this.cargarUbigeos().pipe(
            map(res => {
                return res.departamentos || [];
            })
        );
    }

    getProvincias(codigoDepartamento: string): Observable<Provincia[]> {
        return this.cargarUbigeos().pipe(
            map(res => {
                const provincias = res.provincias ? res.provincias.filter((p: Provincia) => p.departamentoCodigo === codigoDepartamento) : [];
                return provincias;
            })
        );
    }

    getDistritos(codigoProvincia: string): Observable<Distrito[]> {
        return this.cargarUbigeos().pipe(
            map(res => {
                const distritos = res.distritos ? res.distritos.filter((d: Distrito) => d.provinciaCodigo === codigoProvincia) : [];
                return distritos;
            })
        );
    }
}
