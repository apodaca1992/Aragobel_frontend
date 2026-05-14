import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// El componente de la página
import { PanelAdminComponent } from './panel-admin.component';
// Importa tus componentes compartidos (si usas el header ahí)
import { ComponentsModule } from 'src/app/components/components.module';

// 1. Importa tus nuevos componentes de reporte
import { AsistenciaComponent } from './reportes/asistencia/asistencia.component';
import { EntregasComponent } from './reportes/entregas/entregas.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule, // Para usar <app-header> y otros componentes propios
    RouterModule.forChild([
      {
        path: '',
        component: PanelAdminComponent
      },
      // 2. Define las rutas hijas dentro de administración
      {
        path: 'reporte-asistencia',
        component: AsistenciaComponent
      },
      {
        path: 'reporte-entregas',
        component: EntregasComponent
      }
    ])
  ],
  declarations: [
    PanelAdminComponent,
    AsistenciaComponent,
    EntregasComponent
  ]
})
export class PanelAdminPageModule {}