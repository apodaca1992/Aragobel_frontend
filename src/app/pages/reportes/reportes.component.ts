import { Component, OnInit } from "@angular/core";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss'],
})
export class ReportesComponent  implements OnInit {
  segmento: string = 'asistencia';

  reportAsistencia = [
    { nombre: 'Adrian G.', fecha: new Date(), entrada: '08:02 AM' },
    { nombre: 'Jose L.', fecha: new Date(), entrada: '08:15 AM' },
    { nombre: 'Maria F.', fecha: new Date(), entrada: '07:55 AM' },
  ];

  reportRepartidores = [
    { nombre: 'Ramon Valdes', entregas: 45 },
    { nombre: 'Carlos Villagran', entregas: 38 },
  ];

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {
    //this.toastService.show('¡Guardado correctamente!', 'success', 'checkmark-circle-outline');
  }

  onDateChange(event: any) {
    const fechaSeleccionada = new Date(event.detail.value);
    console.log("Filtrando datos para:", fechaSeleccionada);
    // Aquí dispararías la carga de datos de tu API de Node.js para ese mes
  }

  exportarPDF() {
    const doc = new jsPDF();
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
    doc.save(`Reporte_${this.segmento}_${fechaDoc}.pdf`);
  }


}
