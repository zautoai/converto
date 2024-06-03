import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SetupGuard } from 'src/app/shared/guard/setup.guard';
import { CampaignComponent } from './campaign/campaign/campaign.component';
import { VisitorsComponent } from './visitors/visitors.component';

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
    title: "Visitors",
    component: VisitorsComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'visitors/:id',
    title: "Visitors",
    component: VisitorsComponent,
    canActivate: [SetupGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketingRoutingModule { }
