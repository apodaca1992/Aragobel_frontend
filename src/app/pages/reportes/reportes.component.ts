import { Component, OnInit } from "@angular/core";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PreferencesService } from '@services/preference.service';
import { AsistenciaService } from '@services/asistencia.service';
import { EntregaService } from '@services/entrega.service'; // Asegúrate de tener este import

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss'],
})
export class ReportesComponent  implements OnInit {
  segmento: string = 'asistencia';

  // Objeto para controlar la visibilidad
  modulosConfig = {
    checador: true,
    entregas: true
  };

  estatusEntregas: { [key: number]: { texto: string, color: string } } = {
    1: { texto: 'Creado', color: 'medium' },
    2: { texto: 'En Ruta', color: 'warning' },
    3: { texto: 'Finalizado', color: 'success' }
  };

  reportAsistencia: any[] = [];
  reportEntregas: any[] = [];
  mesReporteActual: string = new Date().toISOString().substring(0, 7);

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService,
    private _preferencesService: PreferencesService,
    private _asistenciaService: AsistenciaService,
    private _entregaService: EntregaService
  ) {

  }

  async ngOnInit() {
    //this.toastService.show('¡Guardado correctamente!', 'success', 'checkmark-circle-outline');
    await this.cargarConfiguracionModulos();

    this.definirSegmentoInicial(this.mesReporteActual);
  }

  async cargarConfiguracionModulos() {
    const empresaStr = await this._preferencesService.getItem('empresa');
    if (empresaStr) {
      const empresaData = JSON.parse(empresaStr);
      // Extraemos los módulos (si no existen, por defecto true)
      this.modulosConfig = empresaData.modulos ?? { checador: true, entregas: true };
    }
  }

  // Esto evita que el segmento quede vacío si 'asistencia' está desactivado
  async definirSegmentoInicial(mes: string) {
    if (!this.modulosConfig.checador && this.modulosConfig.entregas) {
      this.segmento = 'entregas';
      await this.obtenerEntregasPorMes(mes);
    } else if (this.modulosConfig.checador) {
      this.segmento = 'asistencia';
      await this.obtenerMarcajesPorMes(mes);
    }
  }

  onDateChange(event: any) {
    const fecha = event.detail.value; // Formato "2026-05-24..."
    this.mesReporteActual = fecha.substring(0, 7); // Extrae "2026-05"    
   
    // Cargamos los datos de la pestaña que esté viendo el usuario actualmente
    this.cargarDatosSegunSegmento();
  }

  cargarDatosSegunSegmento() {
    if (this.segmento === 'asistencia' && this.modulosConfig.checador) {
      this.obtenerMarcajesPorMes(this.mesReporteActual);
    } else if (this.segmento === 'entregas' && this.modulosConfig.entregas) {
      this.obtenerEntregasPorMes(this.mesReporteActual);
    }
  }

  async obtenerEntregasPorMes(mes: string) {
    const user = JSON.parse(await this._preferencesService.getItem('user') ?? '{}');
    
    const datos = {         
      id_tienda: user.id_tienda,
      id_empresa: user.id_empresa,
      fecha_venta_gte: `${mes}-01`,
      fecha_venta_lte: `${mes}-31`,
      activo: 1
    };
    console.log(datos)
    this._entregaService.get(datos).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.reportEntregas = res.data;
          console.log('Entregas cargadas:', this.reportEntregas);
        }
      },
      error: (err) => console.error('Error al cargar entregas:', err)
    });
  }

  async obtenerMarcajesPorMes(mes: string){
    // Supongamos que ya tienes el id_tienda_activa en el objeto user
    const user = JSON.parse(await this._preferencesService.getItem('user') ?? '{}');
    const idTienda = user.id_tienda;
    
    const datos = {         
      id_tienda: idTienda,
      //id_usuario: user.id,
      id_empresa: user.id_empresa,
      fecha_gte: `${mes}-01`, // Mayor o igual que
      fecha_lte: `${mes}-31`, // Menor o igual que
      activo: 1
    };
    console.log(datos)
    this._asistenciaService.get(datos).subscribe({
      next: (res: any) => {
        if (res.data) {
          console.log(res.data);
          this.reportAsistencia = res.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar historial del día:', err);
      }
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


}
