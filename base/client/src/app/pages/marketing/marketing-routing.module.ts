import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SetupGuard } from 'src/app/shared/guard/setup.guard';
import { CampaignComponent } from './campaign/campaign/campaign.component';
import { VisitorsComponent } from './visitors/visitors.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { IntentScoringComponent } from './intent-scoring/intent-scoring.component';

const routes: Routes = [
  {
    path: 'campaigns',
    redirectTo: 'campaigns/all',
    pathMatch: 'full'
  },
  {
    path: 'campaigns/:id',
    title: "Campaigns",
    component: CampaignComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'visitors',
    redirectTo: 'visitors/all',
    pathMatch: 'full'
  },
  {
    path: 'visitors/:id',
    title: "Visitors",
    component: VisitorsComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'form-builder/:id',
    title: "FormBuilder",
    component: FormBuilderComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'form-builder',
    redirectTo: 'form-builder/all',
    pathMatch: 'full'
  },
  {
    path: 'intent-scoring',
    title: 'Intent Scoring',
    component: IntentScoringComponent,
    canActivate: [SetupGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketingRoutingModule { }
