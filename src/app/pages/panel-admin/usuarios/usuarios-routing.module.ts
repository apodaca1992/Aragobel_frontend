import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListUsuariosComponent } from './list-usuarios/list-usuarios.component';
import { FormUsuariosComponent } from './form-usuarios/form-usuarios.component';

const routes: Routes = [
  {
    path: '', // Vista principal del catálogo (Tabla con la lista de usuarios)
    component: ListUsuariosComponent
  },
  {
    path: 'nuevo', // Formulario para crear un nuevo usuario
    component: FormUsuariosComponent
  },
  {
    path: 'editar/:id', // Formulario para actualizar datos de un usuario por su ID
    component: FormUsuariosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule { }