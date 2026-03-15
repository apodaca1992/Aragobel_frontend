import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { ComponentsModule } from './components/components.module';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

//LIBRARIES
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './interceptors/error.interceptor'; // Ajusta la ruta
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { tokenInterceptor } from './interceptors/token.interceptor'; // Tu nuevo interceptor
import { environment } from '@env/environment';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

jeepSqlite(window);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ComponentsModule,
    BrowserModule,
    IonicModule.forRoot({
      mode: 'md' // Fuerza el modo Android para que sea consistente
    }),
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,    
    CommonModule,
    FeatherModule.pick(allIcons)
  ],
  providers: [
    { 
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy 
    },
    AndroidPermissions,
    provideHttpClient(
      withInterceptors([
        loadingInterceptor, // Controla el spinner
        tokenInterceptor,   // Inyecta el JWT
        errorInterceptor    // Atrapa fallos (401, 500, etc)
      ]) // <--- Aquí registras el interceptor funcional
    ),  
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule {}
