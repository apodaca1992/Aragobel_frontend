
import { Component, OnInit } from "@angular/core";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PreferencesService } from '@services/preference.service';
import { AsistenciaService } from '@services/asistencia.service';

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
    id_usuario: '',
    id_tienda: ''
  };

  selectedFilterLabel = 'Este mes';

  reportAsistenciaAgrupado: any[] = [
    {
      id_usuario: 1,
      nombre_usuario: "Jesus Adrian Apodaca Campos",
      total_horas_periodo: 25.5,
      balance_extras: 1.5,
      foto: "J",
      detalles: [
        { fecha: '2026-05-12', entrada: '08:00 AM', salida: '05:00 PM', total_dia: 9.0, estatus: 'Extra', color: 'success' },
        { fecha: '2026-05-13', entrada: '08:00 AM', salida: '04:00 PM', total_dia: 8.0, estatus: 'A tiempo', color: 'light' },
        { fecha: '2026-05-14', entrada: '08:00 AM', salida: '12:00 PM', total_dia: 4.0, estatus: '-4h Faltante', color: 'danger' }
      ]
    },
    {
      id_usuario: 2,
      nombre_usuario: "Beatriz Luna",
      total_horas_periodo: 20.0,
      balance_extras: -4.0,
      foto: "B",
      detalles: [
        { fecha: '2026-05-12', entrada: '08:00 AM', salida: '12:00 PM', total_dia: 4.0, estatus: 'Faltante', color: 'danger' },
        { fecha: '2026-05-13', entrada: '08:00 AM', salida: '04:00 PM', total_dia: 8.0, estatus: 'A tiempo', color: 'light' },
        { fecha: '2026-05-14', entrada: '08:00 AM', salida: '04:00 PM', total_dia: 8.0, estatus: 'A tiempo', color: 'light' }
      ]
    },
    {
      id_usuario: 3,
      nombre_usuario: "Carlos Mendoza",
      total_horas_periodo: 24.0,
      balance_extras: 0,
      foto: "C",
      detalles: [
        { fecha: '2026-05-12', entrada: '08:00 AM', salida: '04:00 PM', total_dia: 8.0, estatus: 'A tiempo', color: 'light' },
        { fecha: '2026-05-13', entrada: '08:00 AM', salida: '04:00 PM', total_dia: 8.0, estatus: 'A tiempo', color: 'light' },
        { fecha: '2026-05-14', entrada: '08:00 AM', salida: '04:00 PM', total_dia: 8.0, estatus: 'A tiempo', color: 'light' }
      ]
    },
    {
      id_usuario: 4,
      nombre_usuario: "Daniela Reyes",
      total_horas_periodo: 24.3,
      balance_extras: 0.3,
      foto: "D",
      detalles: [
        { fecha: '2026-05-12', entrada: '08:00 AM', salida: '04:10 PM', total_dia: 8.1, estatus: 'Extra', color: 'success' },
        { fecha: '2026-05-13', entrada: '08:00 AM', salida: '04:10 PM', total_dia: 8.1, estatus: 'Extra', color: 'success' },
        { fecha: '2026-05-14', entrada: '08:00 AM', salida: '04:10 PM', total_dia: 8.1, estatus: 'Extra', color: 'success' }
      ]
    },
    {
      id_usuario: 5,
      nombre_usuario: "Eduardo Ortiz",
      total_horas_periodo: 18.0,
      balance_extras: -6.0,
      foto: "E",
      detalles: [
        { fecha: '2026-05-12', entrada: '09:00 AM', salida: '03:00 PM', total_dia: 6.0, estatus: 'Tarde', color: 'danger' },
        { fecha: '2026-05-13', entrada: '09:00 AM', salida: '03:00 PM', total_dia: 6.0, estatus: 'Tarde', color: 'danger' },
        { fecha: '2026-05-14', entrada: '09:00 AM', salida: '03:00 PM', total_dia: 6.0, estatus: 'Tarde', color: 'danger' }
      ]
    }
  ];


  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService,
    private _preferencesService: PreferencesService,
    private _asistenciaService: AsistenciaService
  ) {

  }

  async ngOnInit() {
    this.setFechaActual();
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
    
    const datos = {         
      id_tienda: idTienda,
      //id_usuario: user.id,
      id_empresa: user.id_empresa,
      fecha_gte: this.filtros.inicio,//fecha_gte: `${mes}-01`, // Mayor o igual que
      fecha_lte: this.filtros.fin,//fecha_lte: `${mes}-31`, // Menor o igual que
      activo: 1
    };
    console.log(datos)
    this._asistenciaService.get(datos).subscribe({
      next: (res: any) => {
        if (res.data) {
          console.log(res.data);
          this.reportAsistencia = res.data;
          this.actualizarLabel();
        }
      },
      error: (err) => {
        console.error('Error al cargar historial del día:', err);
      }
    });
  }

  actualizarLabel() {
    const hoy = new Date().toISOString().split('T')[0];

    if (this.filtros.inicio === hoy && this.filtros.fin === hoy) {
      this.selectedFilterLabel = 'Hoy';
    } else if (this.filtros.inicio === this.filtros.fin) {
      this.selectedFilterLabel = this.filtros.inicio;
    } else {
      this.selectedFilterLabel = `${this.filtros.inicio} al ${this.filtros.fin}`;
    }
  }

}

