
import { Component, OnInit } from "@angular/core";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";
import { PreferencesService } from '@services/preference.service';
import { AsistenciaService } from '@services/asistencia.service';
import { UsuarioService } from "@services/usuario.service";
import { FileSystemService } from "@services/file-system.service"; // 👈 Tu servicio inyectado

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html',
  styleUrls: ['./asistencia.component.scss'],
})
export class AsistenciaComponent  implements OnInit {

  reportAsistencia: any[] = [];

  // En tu componente de reporte
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
  ) {

  }

  async ngOnInit() {
    this.setFechaActual();
    await this.cargarListaUsuarios();
    // Aquí puedes llamar a tu carga inicial si lo deseas
    this.aplicarFiltros();
  }

  setFechaActual() {
    const hoy = new Date();
    
    // Convertimos a formato YYYY-MM-DD usando la zona horaria local
    const offset = hoy.getTimezoneOffset();
    const fechaLocal = new Date(hoy.getTime() - (offset * 60 * 1000));
    const fechaFormateada = fechaLocal.toISOString().split('T')[0];

    this.filtros.inicio = fechaFormateada;
    this.filtros.fin = fechaFormateada;
    
    // Actualizamos el label para que el usuario vea que está filtrado por hoy
    this.selectedFilterLabel = 'Hoy';
  }

  async cargarListaUsuarios() {
    const user = JSON.parse(await this._preferencesService.getItem('user') ?? '{}');
    const idTienda = user.id_tienda;

    const datos:any = {         
      tiendas_ids: "array-contains|"+idTienda,
      activo: 1
    };

    // Ajusta según cómo obtengas los usuarios de tu tienda
    this._usuarioService.get(datos).subscribe({
      next: (res: any) => {
        console.log("onteniendo los empleados para el select")
        console.log(res.data)
        this.listaUsuarios = res.data;
      },
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }

  // 1. MÉTODO DE VALIDACIÓN: Controla si se permite o no accionar la descarga
  tieneDatosParaDescargar(): boolean {
    return this.reportAsistenciaAgrupado && this.reportAsistenciaAgrupado.length > 0;
  }

  // 2. LOGICA ACTUALIZADA PARA SOLICITAR EL PDF AL BACKEND
  async exportarPDF() {
    // Validación preventiva secundaria
    if (!this.tieneDatosParaDescargar()) {
      this.toastService.show('No hay datos en pantalla para exportar.', 'warning');
      return;
    }

    const datos = await this.obtenerPayloadFiltros();
    const nombreArchivo = `Reporte_Asistencia_${this.filtros.inicio}_al_${this.filtros.fin}.pdf`;

    // Invocamos el método del servicio que retornará el binario del PDF
    this._asistenciaService.obtenerPdfReporte(datos).subscribe({
      next: async (blob: Blob) => {
        await this._fileSystemService.guardarYAbrirBlob(blob, nombreArchivo, 'application/pdf');
      },
      error: (err) => {
        //this.toastService.show('Ocurrió un error al generar el archivo en el servidor.', 'danger');
        console.error('Error al descargar el PDF:', err);
      }
    });
  }

  /**
   * Helper asíncrono para transformar el Binario (Blob) a un string Base64 puro
   */
  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        // Obtenemos la url del stream y eliminamos el prefijo 'data:*/*;base64,' sobrante
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(blob);
    });
  }

  // Función centralizada para armar los parámetros de asistencia
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
    console.log(datos)
    this._asistenciaService.generarReporte(datos).subscribe({
      next: (res: any) => {
        if (res && res.empleados) {
          this.reportAsistenciaAgrupado = res.empleados;
          this.actualizarLabel();
        } else {
          this.reportAsistenciaAgrupado = [];
        }
      },
      error: (err) => {
        console.error('Error al cargar historial del día:', err);
      }
    });
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

    // Si hay un usuario específico seleccionado, lo añadimos al label
    if (this.filtros.id_usuario !== 'todos') {
      const usuario = this.listaUsuarios.find(u => u.id === this.filtros.id_usuario);
      this.selectedFilterLabel = usuario ? `${usuario.nombre} (${label})` : label;
    } else {
      this.selectedFilterLabel = label;
    }
  }

}

