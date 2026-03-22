import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { ListEntregasComponent } from './list-entregas/list-entregas.component';
import { FormEntregasComponent } from './form-entregas/form-entregas.component';

const routes: Routes = [  
  { path: '',         component: ListEntregasComponent },
  { path: 'add',     component: FormEntregasComponent },
  { path: ':id',     component: FormEntregasComponent }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntregasPageRoutingModule {}
