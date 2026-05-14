import { Component, OnInit } from "@angular/core";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";
import { AdminOption } from '@interfaces/admin-option.interface';

@Component({
  selector: 'app-panel-admin',
  templateUrl: './panel-admin.component.html',
  styleUrls: ['./panel-admin.component.scss'],
})
export class PanelAdminComponent  implements OnInit {
  
  options: AdminOption[] = [
    { title: 'Usuarios', icon: 'people-outline', route: '/panel-admin/usuarios', class: 'blue', section: 'Personal y Seguridad' },
    { title: 'Asistencias', icon: 'time-outline', route: '/panel-admin/asistencias', class: 'purple', section: 'Personal y Seguridad' },
    { title: 'Vehículos', icon: 'bus-outline', route: '/panel-admin/vehiculos', class: 'orange', section: 'Infraestructura y Logística' },
    { title: 'Entregas', icon: 'bicycle-outline', route: '/panel-admin/deliveries', class: 'black', section: 'Infraestructura y Logística' },
    // Cambiamos iconos a "analytics" y "bar-chart" para diferenciar
    { title: 'Asistencia', icon: 'analytics-outline', route: '/panel-admin/reporte-asistencia', class: 'report', section: 'Reportes y Resultados' },
    { title: 'Entregas', icon: 'bar-chart-outline', route: '/panel-admin/reporte-entregas', class: 'report', section: 'Reportes y Resultados' },
  ];

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {
    //this.toastService.show('¡Guardado correctamente!', 'success', 'checkmark-circle-outline');
  }

  // Agrupamos las opciones por nombre de sección
  get groupedOptions() {
    return this.options.reduce((acc, opt) => {
      if (!acc[opt.section]) acc[opt.section] = [];
      acc[opt.section].push(opt);
      return acc;
    }, {} as { [key: string]: AdminOption[] });
  }

  // Obtenemos solo los nombres de las secciones para el primer loop
  get sectionNames() {
    return Object.keys(this.groupedOptions);
  }


}
