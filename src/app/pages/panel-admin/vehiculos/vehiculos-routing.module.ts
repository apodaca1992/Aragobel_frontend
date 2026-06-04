import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListVehiculosComponent } from './list-vehiculos/list-vehiculos.component';
import { FormVehiculosComponent } from './form-vehiculos/form-vehiculos.component';

const routes: Routes = [
  {
    path: '', // Pantalla principal del catálogo (Tabla/Lista)
    component: ListVehiculosComponent
  },
  {
    path: 'nuevo', // Formulario de alta
    component: FormVehiculosComponent
  },
  {
    path: 'editar/:id', // Formulario de edición pasando el ID del vehículo
    component: FormVehiculosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiculosRoutingModule { }