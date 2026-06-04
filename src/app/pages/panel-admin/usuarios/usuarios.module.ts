import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { IonicModule } from '@ionic/angular'; 

import { UsuariosRoutingModule } from './usuarios-routing.module';
import { ListUsuariosComponent } from './list-usuarios/list-usuarios.component';
import { FormUsuariosComponent } from './form-usuarios/form-usuarios.component';


import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  declarations: [
    ListUsuariosComponent,
    FormUsuariosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,         
    IonicModule,   
    ComponentsModule,
    UsuariosRoutingModule
  ]
})
export class UsuariosModule { }


