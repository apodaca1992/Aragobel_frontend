import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { IonicModule } from '@ionic/angular'; 

import { VehiculosRoutingModule } from './vehiculos-routing.module';
import { ListVehiculosComponent } from './list-vehiculos/list-vehiculos.component';
import { FormVehiculosComponent } from './form-vehiculos/form-vehiculos.component';

import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  declarations: [
    ListVehiculosComponent,
    FormVehiculosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,         
    IonicModule,         
    ComponentsModule,    
    VehiculosRoutingModule
  ]
})
export class VehiculosModule { }