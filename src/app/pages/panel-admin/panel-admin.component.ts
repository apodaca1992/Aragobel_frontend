import { Component, OnInit } from "@angular/core";
import { LoadingService } from "@services/loading.service";
import { ToastService } from "@services/toast.service";
import { AdminOption } from '@interfaces/admin-option.interface';
import { PreferencesService } from '@services/preference.service';

interface SeccionAgrupada {
  nombre: string;
  opciones: AdminOption[];
}

@Component({
  selector: 'app-panel-admin',
  templateUrl: './panel-admin.component.html',
  styleUrls: ['./panel-admin.component.scss'],
})
export class PanelAdminComponent implements OnInit {
  
  private allOptions: AdminOption[] = [
    { title: 'Usuarios', icon: 'people-outline', route: '/panel-admin/usuarios', class: 'blue', section: 'Personal y Seguridad' },
    { title: 'Vehículos', icon: 'bus-outline', route: '/panel-admin/vehiculos', class: 'orange', section: 'Infraestructura y Logística' },
    { title: 'Colonias', icon: 'map-outline', route: '/panel-admin/colonias', class: 'green', section: 'Infraestructura y Logística' },
    { title: 'Asistencia', icon: 'analytics-outline', route: '/panel-admin/reporte-asistencia', class: 'report', section: 'Reportes y Resultados', key: 'checador' },
    { title: 'Entregas', icon: 'bar-chart-outline', route: '/panel-admin/reporte-entregas', class: 'report', section: 'Reportes y Resultados', key: 'entregas' },
  ];

  // ⚡ OPTIMIZACIÓN: Almacén estático final para el HTML (Elimina Getters costosos)
  sections: SeccionAgrupada[] = [];

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService,
    private _preferencesService: PreferencesService,
  ) {}

  ngOnInit() {
    // ⚡ PASO 1: Agrupar instantáneamente las opciones básicas fijas para que la UI no nazca vacía
    this.procesarYAgruparOpciones(this.allOptions.filter(opt => !opt.key));
    
    // ⚡ PASO 2: Resolver los módulos asíncronos en segundo plano sin congelar la pantalla
    this.cargarOpcionesSegunModulos();
  }

  async cargarOpcionesSegunModulos() {
    const empresaRaw = await this._preferencesService.getItem('empresa');

    if (!empresaRaw) {
      this.procesarYAgruparOpciones(this.allOptions);
      return;
    }

    const empresa = JSON.parse(empresaRaw);
    const modulosHabilitados = empresa.modulos || {};

    // Filtrar opciones válidas según los módulos activos del cliente
    const opcionesFiltradas = this.allOptions.filter(opt => {
      if (!opt.key) return true;
      return modulosHabilitados[opt.key] === true;
    });

    // Actualizamos las secciones una sola vez
    this.procesarYAgruparOpciones(opcionesFiltradas);
  }

  // ⚡ LA MAGIA DEL RENDIMIENTO: Transforma el array plano a una estructura agrupada limpia una sola vez
  private procesarYAgruparOpciones(listaOpciones: AdminOption[]) {
    const agrupado = listaOpciones.reduce((acc, opt) => {
      if (!acc[opt.section]) acc[opt.section] = [];
      acc[opt.section].push(opt);
      return acc;
    }, {} as { [key: string]: AdminOption[] });

    // Convertimos el diccionario a un Array de objetos nativos estructurado para un *ngFor eficiente
    this.sections = Object.keys(agrupado).map(nombreSeccion => ({
      nombre: nombreSeccion,
      opciones: agrupado[nombreSeccion]
    }));
  }
}