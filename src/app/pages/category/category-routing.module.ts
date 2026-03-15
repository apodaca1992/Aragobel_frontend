import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { ListCategoryComponent } from './list-category/list-category.component';
import { FormCategoryComponent } from './form-category/form-category.component';

const routes: Routes = [  
  { path: '',         component: ListCategoryComponent },
  { path: 'add',     component: FormCategoryComponent },
  { path: ':id',     component: FormCategoryComponent }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoryPageRoutingModule {}
