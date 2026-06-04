import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Crucial para que funcione [(ngModel)] en los filtros
import { IonicModule } from '@ionic/angular'; // <-- Crucial para corregir el error de 'ion-header'

import { ColoniasRoutingModule } from './colonias-routing.module';
import { ListColoniasComponent } from './list-colonias/list-colonias.component';
import { FormColoniasComponent } from './form-colonias/form-colonias.component';

// Importa el módulo donde tienes tu componente <app-header> compartido
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  declarations: [
    ListColoniasComponent,
    FormColoniasComponent
  ],
  imports: [
    CommonModule,
    FormsModule,         // 👈 Habilita formularios y filtros
    IonicModule,         // 👈 Soluciona el error NG8001 de los elementos de Ionic
    ComponentsModule,    // 👈 Habilita el uso de <app-header>
    ColoniasRoutingModule
  ]
})
export class ColoniasModule { }