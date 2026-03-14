import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';

import { ListCategoryComponent } from './list-category/list-category.component';
import { FormCategoryComponent } from './form-category/form-category.component';
import { CategoryPageRoutingModule } from './category-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoryPageRoutingModule,
    ComponentsModule
  ],
  declarations: [
    ListCategoryComponent,
    FormCategoryComponent
  ]
})
export class CategoryPageModule {}
