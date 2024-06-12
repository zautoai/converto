import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ZautoDashboardComponent } from './dashboard/dashboard.component';
import { conversationcomponent } from './conversation/conversation/conversation.component';
import { leadscomponent } from './leads/leads.component';
import { StagesComponent } from './stages/stages.component';
import { CallToActionComponent } from './call-to-action/call-to-action.component';
import { PlatformsComponent } from './platforms/platforms.component';
import { SMTPConfigComponent } from './smtpconfig/smtpconfig.component';
import { SitesComponent } from './sites/sites.component';
import { TeamComponent } from './teams/team.component';
import { ExternalApisComponent } from './external-apis/external-apis.component';
import { HubspotComponent } from './hubspot/hubspot.component';
import { IntegrationComponent } from './integrations/integration/integration.component';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { LeadCategoryComponent } from './lead-category/lead-category/lead-category.component';
import { CalendarEventComponent } from './calendar-event/calendar-event.component';
import { SetupGuard } from '../shared/guard/setup.guard';
import { LeadConfigComponent } from './lead-config/lead-config.component';
import { StartersConfigComponent } from './starters-config/starters-config.component';
import { CustomiseAvatarComponent } from './customise-avatar/customise-avatar/customise-avatar.component';
import { PluginsComponent } from './plugins/plugins.component';
import { AbmComponent } from './abm/abm.component';
import { AccountviewComponent } from './accountview/accountview.component';
import { ContactviewComponent } from './contactview/contactview.component';
import { SegmentComponent } from './segment/segment.component';
import { IcpComponent } from './icp/icp.component';
import { IcpCreatorComponent } from './icp-creator/icp-creator.component';
import { IcpviewComponent } from './icpview/icpview.component';
import { AbmviewComponent } from './abmview/abmview.component';

const routes: Routes = [

  {
    path: 'abm/:id',
    title: "abm",
    component: AbmComponent,
    canActivate: [SetupGuard]
  },

  {
    path: 'abm/view-abm/:id',
    title: "abmview",
    component: AbmviewComponent,

  },

  { path: 'accounts/view-account/:id', component: AccountviewComponent },
  { path: 'contacts/view-contacts/:id', component: ContactviewComponent },

  {
    path: 'dashboard',
    title: "Dashboard",
    component: ZautoDashboardComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'conversations',
    title: "Conversations",
    component: conversationcomponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'conversations/:id',
    title: "Conversations",
    component: conversationcomponent,
    canActivate: [SetupGuard]
  },

  // {
  //   path: 'leads',
  //   title: "Leads",
  //   component: leadscomponent,
  //   canActivate:[SetupGuard]
  // },
  {
    path: 'abm',
    title: "abm",
    component: AbmComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'leads/:id',
    title: "Leads",
    component: leadscomponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'sales-playbook',
    title: "sales-playbook",
    component: StagesComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'starters',
    title: "Starters",
    component: StartersConfigComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'call-to-action',
    title: "Call to action",
    component: CallToActionComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'call-to-action/:id',
    title: "Call to action",
    component: CallToActionComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'platforms',
    title: 'Platforms',
    component: PlatformsComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'smtp',
    title: 'smtp',
    component: SMTPConfigComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'sites',
    title: "Sites",
    component: SitesComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'segment',
    title: "Segment",
    component: SegmentComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'icp',
    title: "ICP",
    component: IcpComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'icp/create',
    title: "ICP",
    component: IcpCreatorComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'icp/view',
    title: "ICP",
    component: IcpviewComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'icp/edit/:id',
    title: "ICP",
    component: IcpCreatorComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'sites/:id',
    title: "Sites",
    component: SitesComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'team',
    title: "Team",
    component: TeamComponent,
    canActivate: [SetupGuard]
  },

  // { 
  //   path: 'settings', 
  //   title: "Settings", 
  //   component: SettingsComponent,
  //   canActivate:[SetupGuard] 
  // },
  {
    path: 'customize-avatar',
    title: "Customize Avatar",
    component: CustomiseAvatarComponent,
    canActivate: [SetupGuard]
  },
  // { 
  //   path: 'lead-categories', 
  //   title: "Category", 
  //   component: LeadCategoryComponent 
  // },
  {
    path: 'lead-categories/:id',
    title: "Category",
    component: LeadCategoryComponent
  },
  {
    path: 'external-apis',
    title: "External apis",
    component: ExternalApisComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'external-apis/:id',
    title: "External apis",
    component: ExternalApisComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'hubspot',
    title: 'Hubspot',
    component: HubspotComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'integrations',
    title: 'Integrations',
    component: IntegrationComponent,
    canActivate: [SetupGuard]
  },
  // {
  //   path:'calendar',
  //   title: 'Calendar',
  //   component: CalenderComponent,
  //   canActivate:[SetupGuard]
  // },
  {
    path: 'calendar-events',
    title: 'Calendar Events',
    component: CalendarEventComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'file-manager',
    title: 'FileManager',
    component: FileManagerComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'lead-settings',
    title: 'Lead settings',
    component: LeadConfigComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'plugins',
    title: 'Plugins',
    component: PluginsComponent,
    canActivate: [SetupGuard]
  },
  {
    path: '',
    loadChildren: () => import('./engagements/engagements.module').then(m => m.EngagementsModule)
  },
  {
    path: '',
    loadChildren: () => import('./marketing/marketing.module').then(m => m.MarketingModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
