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
        console.log('🔥 Cargando UBIGEOS desde:', this.url);
        if (this.data) {
            console.log('✅ Datos en cache:', this.data);
            return new Observable(observer => observer.next(this.data));
        }
        return this.http.get<any>(this.url).pipe(
            map(res => {
                console.log('📡 Respuesta cruda de API:', res);
                // Transformar jerarquía en listas
                const departamentos: Departamento[] = [];
                const provincias: Provincia[] = [];
                const distritos: Distrito[] = [];

                for (let depName in res) {
                    const depCodigo = depName; // si quieres, puedes mapear a un código real
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
                console.log('✅ Datos transformados:', this.data);
                console.log(`📊 Total: ${departamentos.length} departamentos, ${provincias.length} provincias, ${distritos.length} distritos`);
                return this.data;
            })
        );
    }

    getDepartamentos(): Observable<Departamento[]> {
        return this.cargarUbigeos().pipe(
            map(res => {
                console.log('🏛️ Departamentos encontrados:', res.departamentos);
                return res.departamentos || [];
            })
        );
    }

    getProvincias(codigoDepartamento: string): Observable<Provincia[]> {
        console.log('🏘️ Buscando provincias para departamento:', codigoDepartamento);
        return this.cargarUbigeos().pipe(
            map(res => {
                const provincias = res.provincias ? res.provincias.filter((p: Provincia) => p.departamentoCodigo === codigoDepartamento) : [];
                console.log('🏘️ Provincias encontradas:', provincias);
                return provincias;
            })
        );
    }

    getDistritos(codigoProvincia: string): Observable<Distrito[]> {
        console.log('🏠 Buscando distritos para provincia:', codigoProvincia);
        return this.cargarUbigeos().pipe(
            map(res => {
                const distritos = res.distritos ? res.distritos.filter((d: Distrito) => d.provinciaCodigo === codigoProvincia) : [];
                console.log('🏠 Distritos encontrados:', distritos);
                return distritos;
            })
        );
    }
}
