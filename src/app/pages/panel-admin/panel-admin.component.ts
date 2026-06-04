import { Component, OnInit } from "@angular/core";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";
import { AdminOption } from '@interfaces/admin-option.interface';
import { PreferencesService } from '@services/preference.service';

@Component({
  selector: 'app-panel-admin',
  templateUrl: './panel-admin.component.html',
  styleUrls: ['./panel-admin.component.scss'],
})
export class PanelAdminComponent  implements OnInit {
  
  private allOptions: AdminOption[] = [
    { title: 'Usuarios', icon: 'people-outline', route: '/panel-admin/usuarios', class: 'blue', section: 'Personal y Seguridad' },
    //{ title: 'Asistencias', icon: 'time-outline', route: '/panel-admin/asistencias', class: 'purple', section: 'Personal y Seguridad', key: 'checador' },
    { title: 'Vehículos', icon: 'bus-outline', route: '/panel-admin/vehiculos', class: 'orange', section: 'Infraestructura y Logística' },
    { title: 'Colonias', icon: 'map-outline', route: '/panel-admin/colonias', class: 'green', section: 'Infraestructura y Logística' },
    //{ title: 'Entregas', icon: 'bicycle-outline', route: '/panel-admin/deliveries', class: 'black', section: 'Infraestructura y Logística', key: 'entregas' },
    { title: 'Asistencia', icon: 'analytics-outline', route: '/panel-admin/reporte-asistencia', class: 'report', section: 'Reportes y Resultados', key: 'checador' },
    { title: 'Entregas', icon: 'bar-chart-outline', route: '/panel-admin/reporte-entregas', class: 'report', section: 'Reportes y Resultados', key: 'entregas' },
  ];

  // Este es el array que usará el HTML
  options: AdminOption[] = [];

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService,
    private _preferencesService: PreferencesService,
  ) {

  }

  ngOnInit() {
    //this.toastService.show('¡Guardado correctamente!', 'success', 'checkmark-circle-outline');
    this.cargarOpcionesSegunModulos();
  }

  async cargarOpcionesSegunModulos() {
    // 1. Obtener datos de la empresa desde el storage
    const empresaRaw = await this._preferencesService.getItem('empresa');

    if (!empresaRaw) {
      this.options = this.allOptions;
      return;
    }

    const empresa = JSON.parse(empresaRaw);
    const modulosHabilitados = empresa.modulos || {};

    // 2. Filtrar opciones: Si no tiene 'key', pasa. Si tiene 'key', revisamos si el módulo es true.
    this.options = this.allOptions.filter(opt => {
      if (!opt.key) return true; // Usuarios y Vehículos no tienen key, siempre se ven
      return modulosHabilitados[opt.key] === true;
    });
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
