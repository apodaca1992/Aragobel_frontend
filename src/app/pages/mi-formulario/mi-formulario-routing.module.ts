import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { ListMiFormularioComponent } from './list-mi-formulario/list-mi-formulario.component';
import { FormMiFormularioComponent } from './form-mi-formulario/form-mi-formulario.component';

const routes: Routes = [  
  { path: '',         component: ListMiFormularioComponent },
  { path: 'add',     component: FormMiFormularioComponent },
  { path: ':id',     component: FormMiFormularioComponent }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MiFormularioPageRoutingModule {}
