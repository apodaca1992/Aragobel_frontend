
import { Component, OnInit } from "@angular/core";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";
import { PreferencesService } from '@services/preference.service';
import { EntregaService } from '@services/entrega.service';
import { UsuarioService } from "@services/usuario.service";
import { ColoniaService } from "@services/colonia.service";
import { FileSystemService } from "@services/file-system.service";

@Component({
  selector: 'app-entregas',
  templateUrl: './entregas.component.html',
  styleUrls: ['./entregas.component.scss'],
})
export class EntregasComponent  implements OnInit {

  // En tu componente de reporte
  filtros = {
    inicio: '',
    fin: '',
    id_usuario: 'todos',
    id_colonia: 'todos', // Nuevo!
    estatus: 'todos',
    id_tienda: ''
  };

  selectedFilterLabel = 'Hoy';

  reportAgrupado: any[] = [];
  listaUsuarios: any[] = [];
  listaColonias: any[] = [];

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService,
    private _preferencesService: PreferencesService,
    private _entregaService: EntregaService,
    private _usuarioService: UsuarioService,
    private _coloniaService: ColoniaService,
    private _fileSystemService: FileSystemService
  ) {

  }

  async ngOnInit() {
    this.setFechaActual();
    await this.cargarListaUsuarios();
    await this.cargarListaColonias();
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

  async cargarListaColonias() {
    const user = JSON.parse(await this._preferencesService.getItem('user') ?? '{}');
    const idTienda = user.id_tienda;

    const datos:any = {         
      id_tienda: idTienda,
      ignorarLimite: true,
      activo: 1
    };

    this._coloniaService.get(datos).subscribe({
      next: (res: any) => {
        // Adaptamos la respuesta según la estructura de tu api (res o res.data)
        this.listaColonias = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => console.error('Error cargando catálogo de colonias en filtros', err)
    });
  }

  async cargarListaUsuarios() {
    const user = JSON.parse(await this._preferencesService.getItem('user') ?? '{}');
    const idTienda = user.id_tienda;

    const datos:any = {         
      tiendas_ids: "array-contains|"+idTienda,
      ignorarLimite: true,
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
    return this.reportAgrupado && this.reportAgrupado.length > 0;
  }

  // 2. LOGICA ACTUALIZADA PARA SOLICITAR EL PDF AL BACKEND
  async exportarPDF() {
    // Validación preventiva secundaria
    if (!this.tieneDatosParaDescargar()) {
      this.toastService.show('No hay datos en pantalla para exportar.', 'warning');
      return;
    }

    const datos = await this.obtenerPayloadFiltros();
    const nombreArchivo = `Reporte_Entregas_${this.filtros.inicio}_al_${this.filtros.fin}.pdf`;

    // Invocamos el método del servicio que retornará el binario del PDF
    this._entregaService.obtenerPdfReporte(datos).subscribe({
      next: async (blob: Blob) => {
        await this._fileSystemService.guardarYAbrirBlob(blob, nombreArchivo, 'application/pdf');
      },
      error: (err) => {
        //this.toastService.show('Ocurrió un error al generar el archivo en el servidor.', 'danger');
        console.error('Error al descargar el PDF:', err);
      }
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
      ignorarLimite: true,
      activo: 1
    };

    if (this.filtros.id_usuario !== 'todos') {
      datos.id_usuario = this.filtros.id_usuario;
    }

    // NUEVO!! Filtro condicional: Colonia
    if (this.filtros.id_colonia !== 'todos') {
      datos.id_colonia = this.filtros.id_colonia;
    }

    // NUEVO!! Filtro condicional: Estatus
    if (this.filtros.estatus !== 'todos') {
      datos.estatus = this.filtros.estatus;
    }

    return datos;
  }


  async aplicarFiltros() {
    const datos = await this.obtenerPayloadFiltros();
    console.log(datos)
    this._entregaService.generarReporte(datos).subscribe({
      next: (res: any) => {
        if (res && res.entregas) {
          this.reportAgrupado = res.entregas;
          this.actualizarLabel();
        } else {
          this.reportAgrupado = [];
        }
      },
      error: (err) => {
        console.error('Error al cargar historial del día:', err);
      }
    });
  }

  // Método auxiliar para asignar estilos CSS condicionales a los estatus
  getEstatusClass(estatus: string): string {
    if (!estatus) return 'status-registrado';
    
    switch (estatus.toLowerCase()) {
      case 'entregado':
        return 'status-entregado';
      case 'en ruta':
      case 'en_ruta':
        return 'status-ruta';
      case 'cancelado':
        return 'status-cancelado';
      default:
        return 'status-registrado'; // Para "Registrado" o cualquier otro
    }
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

