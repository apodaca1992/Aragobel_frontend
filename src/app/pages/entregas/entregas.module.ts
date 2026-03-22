import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';

import { ListEntregasComponent } from './list-entregas/list-entregas.component';
import { FormEntregasComponent } from './form-entregas/form-entregas.component';
import { EntregasPageRoutingModule } from './entregas-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EntregasPageRoutingModule,
    ComponentsModule
  ],
  declarations: [
    ListEntregasComponent,
    FormEntregasComponent
  ]
})
export class EntregasPageModule {}
