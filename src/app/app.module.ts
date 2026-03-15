import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { ComponentsModule } from './components/components.module';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

//LIBRARIES
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './interceptors/error.interceptor'; // Ajusta la ruta
import { LoadingInterceptor } from './interceptors/loading.interceptor';
//import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha';
import { environment } from '@env/environment';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { LoginComponent } from './pages/login/login.component';
import { ForgetPasswordComponent } from './pages/login/forget-password/forget-password.component';
import { HomeComponent } from './pages/home/home.component';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil.component';

import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader'

jeepSqlite(window)

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgetPasswordComponent,
    HomeComponent,
    MiPerfilComponent
  ],
  imports: [
    ComponentsModule,
    BrowserModule,
    //NgbModule, 
    IonicModule.forRoot({
      mode: 'md' // Fuerza el modo Android para que sea consistente
    }),
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    //RecaptchaV3Module,
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
    }/*, 
    ReCaptchaV3Service,
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.API_KEY,
    }*/,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true // IMPORTANTE: permite tener varios interceptores
    },
    AndroidPermissions
  
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule {}
