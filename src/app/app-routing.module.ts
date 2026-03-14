import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ForgetPasswordComponent } from './pages/login/forget-password/forget-password.component';
import { HomeComponent } from './pages/home/home.component';
import { CategoryPageModule } from '@modules/category/category.module';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil.component';
import { MiFormularioPageModule } from '@modules/mi-formulario/mi-formulario.module';

/*const routes: Routes = [  
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'category',
    loadChildren: () => import('./pages/category/category.module').then( m => m.CategoryPageModule)
  },
  {
    path: 'miPerfil',
    loadChildren: () => import('./pages/mi-perfil/mi-perfil.module').then( m => m.MiPerfilPageModule)
  },
  {
    path: 'formulario',
    loadChildren: () => import('./pages/formulario/formulario.module').then( m => m.FormularioPageModule)
  },
  { path: '**',
    redirectTo: 'login'
  }
];*/

const routes: Routes = [  
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forget-password',
    component: ForgetPasswordComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'category',
    loadChildren: () => CategoryPageModule
  },
  {
    path: 'miPerfil',
    component: MiPerfilComponent
  },
  {
    path: 'formulario',
    loadChildren: () => MiFormularioPageModule
  },
  { path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
