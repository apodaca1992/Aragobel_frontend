import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MenuComponent } from './menu/menu.component';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';


@NgModule({
    declarations: [
        MenuComponent,
        HeaderComponent
    ],
    exports: [
        MenuComponent,
        HeaderComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        RouterModule
    ]
})
export class ComponentsModule {}