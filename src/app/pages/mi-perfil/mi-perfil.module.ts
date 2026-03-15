import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// El componente de la página
import { MiPerfilComponent } from './mi-perfil.component';
// Importa el módulo de tus componentes (para el header)
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // Agrégalo por si acaso usas formularios en el perfil
    IonicModule,
    ComponentsModule,
    RouterModule.forChild([
      {
        path: '',
        component: MiPerfilComponent
      }
    ])
  ],
  declarations: [MiPerfilComponent]
})
export class MiPerfilPageModule {}