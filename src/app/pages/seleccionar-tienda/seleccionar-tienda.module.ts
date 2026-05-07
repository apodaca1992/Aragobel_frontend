import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Importa tu componente actual
import { SeleccionarTiendaComponent } from './seleccionar-tienda.component';
import { ComponentsModule } from 'src/app/components/components.module'; // Si usas app-header ahí

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ComponentsModule, // Para que reconozca tu <app-header>
    RouterModule.forChild([
      {
        path: '',
        component: SeleccionarTiendaComponent
      }
    ])
  ],
  declarations: [SeleccionarTiendaComponent]
})
export class SeleccionarTiendaPageModule {}