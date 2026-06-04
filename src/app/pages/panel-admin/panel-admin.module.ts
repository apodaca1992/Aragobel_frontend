import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// El componente de la página
import { PanelAdminComponent } from './panel-admin.component';
// Importa tus componentes compartidos (si usas el header ahí)
import { ComponentsModule } from 'src/app/components/components.module';

// Importa tus nuevos componentes de reporte (Estos se quedan declarados aquí porque no tienen módulo propio)
import { AsistenciaComponent } from './reportes/asistencia/asistencia.component';
import { EntregasComponent } from './reportes/entregas/entregas.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule, 
    RouterModule.forChild([
      {
        path: '',
        component: PanelAdminComponent
      },
      // Reportes directos
      {
        path: 'reporte-asistencia',
        component: AsistenciaComponent
      },
      {
        path: 'reporte-entregas',
        component: EntregasComponent
      },

      // ========================================================
      // 🚀 NUEVOS MÓDULOS ADMINISTRATIVOS (LAZY LOADING)
      // ========================================================
      {
        path: 'colonias',
        loadChildren: () => import('./colonias/colonias.module').then(m => m.ColoniasModule)
      },
      {
        path: 'vehiculos',
        loadChildren: () => import('./vehiculos/vehiculos.module').then(m => m.VehiculosModule)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule)
      }
    ])
  ],
  declarations: [
    PanelAdminComponent,
    AsistenciaComponent,
    EntregasComponent
    // 💡 OJO: Aquí NO se declaran "ListColoniasComponent", "ListVehiculosComponent", etc.
    // porque ellos ya se declaran dentro de sus respectivos sub-módulos.
  ]
})
export class PanelAdminPageModule {}