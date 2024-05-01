import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustompagesRoutingModule } from './custompages-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { UnderConstructionComponent } from './under-construction/under-construction.component';
import { Error404Component } from './error404/error404.component';
import { Error400Component } from './error400/error400.component';
import { Error401Component } from './error401/error401.component';
import { Error403Component } from './error403/error403.component';
import { Error500Component } from './error500/error500.component';
import { Error503Component } from './error503/error503.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    LockscreenComponent,
    UnderConstructionComponent,
    Error404Component,
    Error400Component,
    Error401Component,
    Error403Component,
    Error500Component,
    Error503Component
  ],
  imports: [

    CommonModule,
    CustompagesRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
    

  ]
})
export class CustompagesModule { }
