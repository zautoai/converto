import { NgModule } from '@angular/core';
import {  RouterModule, Routes } from '@angular/router';
import { ContentLayoutComponent } from './shared/layout-components/layout/content-layout/content-layout.component';
import { content } from './shared/routes/routes copy';


import { ErrorLayoutComponent } from './shared/layout-components/layout/error-layout/error-layout.component';
import { Content_Routes } from './shared/routes/error.routes';
import { AdminGuard } from './shared/guard/admin.guard';
import { LoginGuard } from './shared/guard/loginGuard';
import { SetupCompletedGuard } from './shared/guard/setup-completed.guard';
import { LaunchAvatarComponent } from './launch-avatar/launch-avatar.component';

const routes: Routes = [

  {
    path: '', redirectTo: 'auth/login', pathMatch: 'full',
  },
  {
    path: '', loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule),
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  
  {
    path: 'setup',
    title: "Setup",
    component: LaunchAvatarComponent,
    canActivate: [SetupCompletedGuard]
  },
  // {
  //   path: '',
  //   component: ContentLayoutComponent,
  //   children: setup,
  //   canActivate: [AdminGuard]
  // },
  {
    path: '',
    component: ContentLayoutComponent,
    children:content,
    canActivate: [AdminGuard],
  },
  {
    path: 'app/agents', loadChildren: (arg?:any) => {
      console.log(arg)
      return import('./agent/agent.module').then(m => m.agentModule)
    },
  },
  {
    path: 'app/embedding', loadChildren: (arg?:any) => {
      console.log(arg)
      return import('./embedder/embedder.module').then(m => m.EmbedderModule)
    },
  },
  {
    path: '**',
    component: ErrorLayoutComponent,
    children: Content_Routes
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
