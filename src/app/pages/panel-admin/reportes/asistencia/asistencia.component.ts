import { Component, OnInit } from "@angular/core";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";
import { PreferencesService } from '@services/preference.service';
import { AsistenciaService } from '@services/asistencia.service';
import { UsuarioService } from "@services/usuario.service";
import { FileSystemService } from "@services/file-system.service";

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html',
  styleUrls: ['./asistencia.component.scss'],
})
export class AsistenciaComponent implements OnInit {

  reportAsistencia: any[] = [];

  filtros = {
    inicio: '',
    fin: '',
    id_usuario: 'todos',
    id_tienda: ''
  };

  selectedFilterLabel = 'Hoy';
  reportAsistenciaAgrupado: any[] = [];
  listaUsuarios: any[] = [];

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService,
    private _preferencesService: PreferencesService,
    private _asistenciaService: AsistenciaService,
    private _usuarioService: UsuarioService,
    private _fileSystemService: FileSystemService
  ) {}

  async ngOnInit() {
    this.setFechaActual();
    await this.cargarListaUsuarios();
    this.aplicarFiltros();
  }

  setFechaActual() {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const fechaLocal = new Date(hoy.getTime() - (offset * 60 * 1000));
    const fechaFormateada = fechaLocal.toISOString().split('T')[0];

    this.filtros.inicio = fechaFormateada;
    this.filtros.fin = fechaFormateada;
    this.selectedFilterLabel = 'Hoy';
  }

  async cargarListaUsuarios() {
    const user = JSON.parse(await this._preferencesService.getItem('user') ?? '{}');
    const idTienda = user.id_tienda;

    const datos: any = {         
      tiendas_ids: "array-contains|" + idTienda,
      ignorarLimite: true,
      activo: 1
    };

    this._usuarioService.get(datos).subscribe({
      next: (res: any) => {
        this.listaUsuarios = res.data;
      },
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }

  tieneDatosParaDescargar(): boolean {
    return this.reportAsistenciaAgrupado && this.reportAsistenciaAgrupado.length > 0;
  }

  async exportarPDF() {
    if (!this.tieneDatosParaDescargar()) {
      this.toastService.show('No hay datos en pantalla para exportar.', 'warning');
      return;
    }

    const datos = await this.obtenerPayloadFiltros();
    const nombreArchivo = `Reporte_Asistencia_${this.filtros.inicio}_al_${this.filtros.fin}.pdf`;

    this._asistenciaService.obtenerPdfReporte(datos).subscribe({
      next: async (blob: Blob) => {
        await this._fileSystemService.guardarYAbrirBlob(blob, nombreArchivo, 'application/pdf');
      },
      error: (err) => {
        console.error('Error al descargar el PDF:', err);
      }
    });
  }

  async obtenerPayloadFiltros(): Promise<any> {
    const user = JSON.parse(await this._preferencesService.getItem('user') ?? '{}');
    const idTienda = user.id_tienda;

    const datos: any = {         
      id_tienda: idTienda,
      fecha_inicio: this.filtros.inicio,
      fecha_fin: this.filtros.fin,
      activo: 1
    };

    if (this.filtros.id_usuario !== 'todos') {
      datos.id_usuario = this.filtros.id_usuario;
    }

    return datos;
  }

  async aplicarFiltros() {
    const datos = await this.obtenerPayloadFiltros();
    
    this._asistenciaService.generarReporte(datos).subscribe({
      next: (res: any) => {
        if (res && res.empleados) {
          this.reportAsistenciaAgrupado = res.empleados.map((emp: any) => {
            return {
              ...emp,
              foto: emp.nombre ? emp.nombre.charAt(0).toUpperCase() : 'U',
              asistencias: emp.asistencias ? emp.asistencias.map((dia: any) => {
                
                let estatusLimpio = dia.estatus ? dia.estatus.trim() : 'A tiempo';
                
                return {
                  ...dia,
                  estatus: estatusLimpio,
                  color: this.obtenerColorEstatus(estatusLimpio),
                  
                  entrada: dia.entrada ? { ...dia.entrada, hora: dia.entrada.hora || '--:--' } : { hora: '--:--' },
                  salida: dia.salida ? { ...dia.salida, hora: dia.salida.hora || '--:--' } : { hora: '--:--' },
                  
                  comidas_registradas: dia.comidas_registradas ? dia.comidas_registradas.map((comida: any) => {
                    return {
                      ...comida,
                      salida_comer: comida.salida_comer ? { ...comida.salida_comer, hora: comida.salida_comer.hora || '--:--' } : { hora: '--:--' },
                      regreso_comer: comida.regreso_comer ? { ...comida.regreso_comer, hora: comida.regreso_comer.hora || '--:--' } : { hora: '--:--' },
                      duracion_horas: comida.duracion_horas || comida.duracion_hours || '0'
                    };
                  }) : []
                };
              }) : []
            };
          });
          
          this.actualizarLabel();
        } else {
          this.reportAsistenciaAgrupado = [];
        }
      },
      error: (err) => {
        console.error('Error al cargar historial del día:', err);
        this.reportAsistenciaAgrupado = [];
      }
    });
  }

  obtenerColorEstatus(estatus: string): string {
    if (!estatus) return 'success';
    
    const estatusMinuscula = estatus.toLowerCase();
    
    if (estatusMinuscula.includes('retardo') || estatusMinuscula.includes('exceso comida') || estatusMinuscula.includes('salida temp') || estatusMinuscula.includes('faltante')) {
      return 'danger';
    }
    
    if (estatusMinuscula.includes('a tiempo')) {
      return 'success';
    }
    
    return 'warning';
  }

  actualizarLabel() {
    const hoy = new Date().toISOString().split('T')[0];
    let label = '';

    if (this.filtros.inicio === hoy && this.filtros.fin === hoy) {
      label = 'Hoy';
    } else if (this.filtros.inicio === this.filtros.fin) {
      label = this.filtros.inicio;
    } else {
      label = `${this.filtros.inicio} al ${this.filtros.fin}`;
    }

    if (this.filtros.id_usuario !== 'todos') {
      const usuario = this.listaUsuarios.find(u => u.id === this.filtros.id_usuario);
      this.selectedFilterLabel = usuario ? `${usuario.nombre} (${label})` : label;
    } else {
      this.selectedFilterLabel = label;
    }
  }
}