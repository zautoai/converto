import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ZautoDashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { conversationcomponent } from './conversation/conversation/conversation.component';
import { ChatContainerComponent } from './conversation/chat-container/chat-container.component';
import { SummaryContainerComponent } from './conversation/summary-container/summary-container.component';
import { MarkdownModule } from 'ngx-markdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { leadscomponent } from './leads/leads.component';
import { CampaignComponent } from './campaign/campaign/campaign.component';
import { StatsComponent } from './campaign/stats/stats.component';
import { VisitorsComponent } from './visitors/visitors.component';
import { StagesComponent } from './stages/stages.component';
import { NgScrollbar } from 'ngx-scrollbar';
import { CallToActionComponent } from './call-to-action/call-to-action.component';
import { PlatformsComponent } from './platforms/platforms.component';
import { SMTPConfigComponent } from './smtpconfig/smtpconfig.component';
import { SitesComponent } from './sites/sites.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TeamComponent } from './teams/team.component';
import { LaunchAvatarComponent } from './launch-avatar/launch-avatar.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { SettingsComponent } from './zautosettings/settings/settings.component';
import { LeadConfigComponent } from './lead-config/lead-config.component';
import { CustomiseAvatarComponent } from './customise-avatar/customise-avatar/customise-avatar.component';
import { PlatformLinkComponent } from './platform-link/platform-link/platform-link.component';
import { ExternalApisComponent } from './external-apis/external-apis.component';
import { HubspotComponent } from './hubspot/hubspot.component';
import { IntegrationComponent } from './integrations/integration/integration.component';
import { OAuthButtonComponent } from './integrations/oauth-button/oauth-button.component';
import { CalenderComponent } from './calender/calender.component';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { LeadCategoryComponent } from './lead-category/lead-category/lead-category.component';
import { CalendarEventComponent } from './calendar-event/calendar-event.component';
import { PromptComponent } from './prompt/prompt.component';
import { NgxColorsModule } from 'ngx-colors';
import { StartersConfigComponent } from './starters-config/starters-config.component';
import { CounterCardComponent } from './dashboard/widgets/counter-card/counter-card.component';
import { TableCardComponent } from './dashboard/widgets/table-card/table-card.component';
import { ChartCardComponent } from './dashboard/widgets/chart-card/chart-card.component';
import { WlcomeCardComponent } from './dashboard/widgets/wlcome-card/wlcome-card.component';
import { CounterFormatPipe } from './dashboard/widgets/pipe/CounterFormat.pipe';
import { ProgressCardComponent } from './dashboard/widgets/progress-card/progress-card.component';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { AccountsComponent } from './account/account.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { PluginCardComponent } from './plugins/plugin-card/plugin-card.component';
import { PluginsComponent } from './plugins/plugins.component';
import { CrmContactMappingComponent } from './plugins/crm-mapping/crm-contact-mapping/crm-contact-mapping.component';
import { CrmCompanyMappingComponent } from './plugins/crm-mapping/crm-company-mapping/crm-company-mapping.component';
import { ContactsComponent } from './contacts/contacts.component';
import { CalendarScheduleComponent } from './plugins/calendar-schedule/calendar-schedule.component';
import { AbmComponent } from './abm/abm.component';
import { AccountviewComponent } from './accountview/accountview.component';
import { ContactviewComponent } from './contactview/contactview.component';
import { SegmentComponent } from './segment/segment.component';
import { PlatformLinkModule } from './platform-link/platform-link.module';
import { IcpComponent } from './icp/icp.component';
import { IcpCreatorComponent } from './icp-creator/icp-creator.component';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { IcpviewComponent } from './icpview/icpview.component';
import { IntentScoringComponent } from './intent-scoring/intent-scoring.component';
import { ChannelengagementComponent } from './dashboard/widgets/channelengagement/channelengagement.component';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  declarations: [
    ZautoDashboardComponent,
    AccountsComponent,
    FormBuilderComponent,
    conversationcomponent,
    ChatContainerComponent,
    SummaryContainerComponent,
    AbmComponent,
    leadscomponent,
    CampaignComponent,
    StatsComponent,
    VisitorsComponent,
    StagesComponent,
    CallToActionComponent,
    PlatformsComponent,
    SMTPConfigComponent,
    SitesComponent,
    TeamComponent,
    LaunchAvatarComponent,
    SettingsComponent,
    LeadConfigComponent,
    CustomiseAvatarComponent,
    PlatformLinkComponent,
    ExternalApisComponent,
    HubspotComponent,
    IntegrationComponent,
    OAuthButtonComponent,
    CalenderComponent,
    FileManagerComponent,
    LeadCategoryComponent,
    CalendarEventComponent,
    PromptComponent,
    StartersConfigComponent,
    CounterCardComponent,
    TableCardComponent,
    ChartCardComponent,
    WlcomeCardComponent,
    CounterFormatPipe,
    ProgressCardComponent,
    PluginsComponent,
    PluginCardComponent,
    CrmContactMappingComponent,
    CrmCompanyMappingComponent,
    ContactsComponent,
    CalendarScheduleComponent,
    AccountviewComponent,
    ContactviewComponent,
    SegmentComponent,
    IcpComponent,
    IcpCreatorComponent,
    IcpviewComponent,
    IntentScoringComponent,
    ChannelengagementComponent
  ],
  imports: [
    PlatformLinkModule,
    CommonModule,
    PagesRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    NgSelectModule,
    NgScrollbar,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule.forRoot({
      theme: {
        extendsFromRoot: true,
        'background-color': 'var(--primary-1)',
      },
    }),
    MarkdownModule.forRoot(),
    NgCircleProgressModule.forRoot(),
    NgxDropzoneModule,
    NgxColorsModule,
    NgApexchartsModule,
    NgbProgressbarModule,
    NgbNavModule,
    NgbAccordionModule,
    ComponentsModule
  ],
})
export class PagesModule { }