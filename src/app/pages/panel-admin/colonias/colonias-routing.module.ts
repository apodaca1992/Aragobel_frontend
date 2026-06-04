import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListColoniasComponent } from './list-colonias/list-colonias.component';
import { FormColoniasComponent } from './form-colonias/form-colonias.component';

const routes: Routes = [
  {
    path: '', // Ruta por defecto al entrar al módulo
    component: ListColoniasComponent
  },
  {
    path: 'nuevo', // Para crear
    component: FormColoniasComponent
  },
  {
    path: 'editar/:id', // Para editar una colonia existente
    component: FormColoniasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ColoniasRoutingModule { }