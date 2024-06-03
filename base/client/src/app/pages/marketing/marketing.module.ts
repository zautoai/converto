import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketingRoutingModule } from './marketing-routing.module';
import { CampaignComponent } from './campaign/campaign/campaign.component';
import { StatsComponent } from './campaign/stats/stats.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgScrollbar } from 'ngx-scrollbar';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ComponentsModule } from 'src/app/components/components.module';
import { VisitorsComponent } from './visitors/visitors.component';


@NgModule({
  declarations: [
    CampaignComponent,
    StatsComponent,
    VisitorsComponent
  ],
  imports: [
    CommonModule,
    MarketingRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    NgSelectModule,
    NgScrollbar,
    ReactiveFormsModule,
    ComponentsModule,
    NgxSkeletonLoaderModule.forRoot({
      theme: {
        extendsFromRoot: true,
        'background-color': 'var(--primary-1)',
      },
    }),
  ]
})
export class MarketingModule { }
