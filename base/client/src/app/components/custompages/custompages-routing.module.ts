import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error400Component } from './error400/error400.component';
import { Error401Component } from './error401/error401.component';
import { Error403Component } from './error403/error403.component';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { Error503Component } from './error503/error503.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UnderConstructionComponent } from './under-construction/under-construction.component';

const routes: Routes = [
  {
    path:"**", title:"Not Found" ,component:Error404Component 
    // children:[
    //   {path:"custompages/error400",title:"Slica-Error400",component:Error400Component},
    //   {path:"custompages/error401",title:"Slica-Error401",component:Error401Component},
    //   {path:"custompages/error403",title:"Slica-Error403",component:Error403Component},
    //   {path:"custompages/error404",title:"Slica-Error404",component:Error404Component},
    //   {path:"custompages/error500",title:"Slica-Error500",component:Error500Component},
    //   {path:"custompages/error503",title:"Slica-Error503",component:Error503Component},
    //   {path:"custompages/forgotpassword",title:"Slica-ForgotPassword",component:ForgotPasswordComponent},
    //   {path:"custompages/lockscreen",title:"Slica-LockScreen",component:LockscreenComponent},
    //   {path:"custompages/login",title:"Slica-LogIn",component:LoginComponent},
    //   {path:"custompages/register",title:"Slica-Register",component:RegisterComponent},
    //   {path:"custompages/underconstruction",title:"Slica-UnderConstruction",component:UnderConstructionComponent},
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustompagesRoutingModule { }
