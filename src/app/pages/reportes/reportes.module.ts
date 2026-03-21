import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// El componente de la página
import { ReportesComponent } from './reportes.component';
// Importa tus componentes compartidos (si usas el header ahí)
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule, // Para usar <app-header> y otros componentes propios
    RouterModule.forChild([
      {
        path: '',
        component: ReportesComponent
      }
    ])
  ],
  declarations: [ReportesComponent]
})
export class ReportesPageModule {}