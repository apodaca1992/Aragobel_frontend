import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [  
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'seleccionar-tienda',
    loadChildren: () => import('./pages/seleccionar-tienda/seleccionar-tienda.module').then(m => m.SeleccionarTiendaPageModule),
    canActivate: [authGuard]
  },  
  {
    path: 'checador',
    loadChildren: () => import('./pages/checador/checador.module').then(m => m.ChecadorPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'entregas',
    loadChildren: () => import('./pages/entregas/entregas.module').then(m => m.EntregasPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/mi-perfil/mi-perfil.module').then(m => m.MiPerfilPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'formulario',
    loadChildren: () => import('./pages/mi-formulario/mi-formulario.module').then(m => m.MiFormularioPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'reportes',
    loadChildren: () => import('./pages/reportes/reportes.module').then(m => m.ReportesPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'panel-admin',
    loadChildren: () => import('./pages/panel-admin/panel-admin.module').then(m => m.PanelAdminPageModule),
    canActivate: [authGuard]
  },
  { path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }