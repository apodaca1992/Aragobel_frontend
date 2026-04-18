import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';

import { FormChecadorComponent } from './form-checador/form-checador.component';
import { ChecadorPageRoutingModule } from './checador-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChecadorPageRoutingModule,
    ComponentsModule
  ],
  declarations: [
    FormChecadorComponent
  ]
})
export class ChecadorPageModule {}
