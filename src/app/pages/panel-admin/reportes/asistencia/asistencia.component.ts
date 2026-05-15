
import { Component, OnInit } from "@angular/core";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PreferencesService } from '@services/preference.service';
import { AsistenciaService } from '@services/asistencia.service';
import { UsuarioService } from "@services/usuario.service";

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
  listaUsuarios: any[] = [
    { id: 'blIL9Ts6MeEbubvhnVpP', nombre: 'Jesus Adrian Apodaca Campos' },
    { id: 'user_002', nombre: 'Beatriz Luna' },
    { id: 'user_003', nombre: 'Carlos Mendoza' },
    { id: 'user_004', nombre: 'Daniela Reyes' },
    { id: 'user_005', nombre: 'Eduardo Ortiz' }
  ];

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService,
    private _preferencesService: PreferencesService,
    private _asistenciaService: AsistenciaService,
    private _usuarioService: UsuarioService
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

  exportarPDF() {
    /*const doc = new jsPDF();
    const fechaDoc = new Date().toLocaleDateString();

    // Obtener el nombre del mes seleccionado para el título
    const mesReporte = "ABRIL 2026";

    // 1. Encabezado Estilo "Aragobel"
    doc.setFontSize(22);
    doc.setTextColor(0, 82, 204); // El azul de tu marca
    doc.text('ARAGOBEL', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('SISTEMA DE GESTIÓN - REPORTE DE ' + this.segmento.toUpperCase(), 14, 28);
    doc.text(`REPORTE MENSUAL: ${mesReporte}`, 14, 33);

    // 2. Definir los datos según el segmento activo
    let columnas = [];
    let cuerpo = [];

    if (this.segmento === 'asistencia') {
      columnas = ['Empleado', 'Fecha', 'Entrada'];
      cuerpo = this.reportAsistencia.map(item => [
        item.nombre, 
        new Date(item.fecha).toLocaleDateString(), 
        item.entrada
      ]);
    } else {
      columnas = ['Repartidor', 'Total Entregas'];
      cuerpo = this.reportRepartidores.map(rep => [
        rep.nombre, 
        rep.entregas + ' servicios'
      ]);
    }

    // 3. Crear la tabla
    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: cuerpo,
      theme: 'striped',
      headStyles: { fillColor: [0, 82, 204] }, // Azul institucional
      styles: { fontSize: 10, cellPadding: 3 }
    });

    // 4. Descargar el archivo
    doc.save(`Reporte_${this.segmento}_${fechaDoc}.pdf`);*/
  }


  async aplicarFiltros() {
    // Supongamos que ya tienes el id_tienda_activa en el objeto user
    const user = JSON.parse(await this._preferencesService.getItem('user') ?? '{}');
    const idTienda = user.id_tienda;
    
    const datos:any = {         
      id_tienda: idTienda,
      //id_usuario: user.id,
      fecha_inicio: this.filtros.inicio,//fecha_gte: `${mes}-01`, // Mayor o igual que
      fecha_fin: this.filtros.fin,//fecha_lte: `${mes}-31`, // Menor o igual que
      activo: 1
    };

    // Si el filtro no es 'todos', enviamos el ID específico al Backend
    if (this.filtros.id_usuario !== 'todos') {
      datos.id_usuario = this.filtros.id_usuario;
    }

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

