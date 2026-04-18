import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { FormChecadorComponent } from './form-checador/form-checador.component';

const routes: Routes = [  
  { path: '',         component: FormChecadorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChecadorPageRoutingModule {}
