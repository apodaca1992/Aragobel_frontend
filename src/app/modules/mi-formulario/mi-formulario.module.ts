import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';

import { ListMiFormularioComponent } from './list-mi-formulario/list-mi-formulario.component';
import { FormMiFormularioComponent } from './form-mi-formulario/form-mi-formulario.component';
import { MiFormularioPageRoutingModule } from './mi-formulario-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MiFormularioPageRoutingModule,
    ComponentsModule
  ],
  declarations: [
    ListMiFormularioComponent,
    FormMiFormularioComponent
  ]
})
export class MiFormularioPageModule {}
