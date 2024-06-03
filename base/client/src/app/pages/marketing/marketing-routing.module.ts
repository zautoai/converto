import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SetupGuard } from 'src/app/shared/guard/setup.guard';
import { CampaignComponent } from './campaign/campaign/campaign.component';

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketingRoutingModule { }
