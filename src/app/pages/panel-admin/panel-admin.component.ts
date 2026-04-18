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
    { title: 'Usuarios', icon: 'people-outline', route: '/admin/usuarios', class: 'blue', section: 'Personal y Seguridad' },
    { title: 'Roles', icon: 'shield-checkmark-outline', route: '/admin/roles', class: 'purple', section: 'Personal y Seguridad' },
    { title: 'Tiendas', icon: 'storefront-outline', route: '/admin/tiendas', class: 'green', section: 'Infraestructura y Logística' },
    { title: 'Vehículos', icon: 'bus-outline', route: '/admin/vehiculos', class: 'orange', section: 'Infraestructura y Logística' },
    { title: 'Entregas', icon: 'bicycle-outline', route: '/admin/deliveries', class: 'black', section: 'Infraestructura y Logística' },
    //{ title: 'Categorías', icon: 'list-outline', route: '/category', class: 'red', section: 'Catálogos' },
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
