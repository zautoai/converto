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
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { FormCardComponent } from './form-builder/components/form-card/form-card.component';
import { FormPreviewCardComponent } from './form-builder/components/form-preview-card/form-preview-card.component';
import { IntentScoringComponent } from './intent-scoring/intent-scoring.component';
import { VisitorCardComponent } from './visitors/components/visitor-card/visitor-card.component';
import { VisitorPreviewComponent } from './visitors/components/visitor-preview/visitor-preview.component';


@NgModule({
  declarations: [
    CampaignComponent,
    StatsComponent,
    VisitorsComponent,
    FormBuilderComponent,
    FormCardComponent,
    FormPreviewCardComponent,
    IntentScoringComponent,
    VisitorCardComponent,
    VisitorPreviewComponent,
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
