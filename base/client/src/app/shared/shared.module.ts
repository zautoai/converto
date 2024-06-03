import { NgModule } from '@angular/core';
import { FooterComponent } from './layout-components/footer/footer.component';
import { HeaderComponent } from './layout-components/header/header.component';
import { LoaderComponent } from './layout-components/loader/loader.component';
import { PageHeaderComponent } from './layout-components/page-header/page-header.component';
import { SidebarComponent } from './layout-components/sidebar/sidebar.component';
import { TabToTopComponent } from './layout-components/tab-to-top/tab-to-top.component';
import { ContentLayoutComponent } from './layout-components/layout/content-layout/content-layout.component';
import { ErrorLayoutComponent } from './layout-components/layout/error-layout/error-layout.component';
import { MarkdownModule } from 'ngx-markdown';

import { SwitcherLayoutComponent } from './layout-components/layout/switcher-layout/switcher-layout.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgScrollbar, NgScrollbarModule } from 'ngx-scrollbar';
import { ClickToCopyDirective } from './directives/click-to-copy.directive';

import { RightSidebarComponent } from './layout-components/right-sidebar/right-sidebar.component';
import { HoverEffectSidebarDirective } from './directives/hover-effect-sidebar.directive';
import { CommonModule } from '@angular/common';
import { FullscreenDirective } from './directives/fullscreen-toggle.directive';
import { ToggleThemeDirective } from './directives/toggle-theme.directive';
import { SidemenuToggleDirective } from './directives/sidemenuToggle';
import { HeaderSwitcherComponent } from './layout-components/header-switcher/header-switcher.component';
import { SearchComponentComponent } from './layout-components/search-component/search-component.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChatbotComponent } from './layout-components/chatbot/chatbot.component';
import { PaginationComponent } from './layout-components/pagination/pagination.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { ZautoLayoutComponent } from './layout-components/layout/zauto-layout/zauto-layout.component';
import { AgentInterceptor } from './interceptors/agent.interceptor';

import { CountUpModule } from "ngx-countup";
import { DashCardComponent } from './layout-components/dash-card/dash-card.component';
import { DashChartComponent } from './layout-components/dash-chart/dash-chart.component';
import { AvatarInterceptor } from './interceptors/avatar.interceptor';
import { DateRangeSelectionComponent } from './layout-components/date-range-selection/date-range-selection.component';
import { LiveScrollDirective } from './directives/live-scroll.directive';
import { LoaderService } from './services/loader.service';
import { LoaderInterceptor } from './interceptors/loader-interceptor.interceptor';
import { DashListComponent } from './layout-components/dash-list/dash-list.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MomentPipe } from './pipes/moment.pipe';
import { ImageGeneratorDirective } from './directives/image-generator.directive';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MarkdownDirective } from './directives/markdown.directive';
import { LeadPipe } from './pipes/lead.pipe';

import { WidgetsModule } from '../widgets/widgets.module';
import { DataTableModule } from './data-table/data-table.module';
import { ComponentsModule } from '../components/components.module';





@NgModule({
  declarations: [
    FooterComponent,
    HeaderComponent,
    LoaderComponent,
    PageHeaderComponent,
    SidebarComponent,
    SwitcherLayoutComponent,
    TabToTopComponent,
    ContentLayoutComponent,
    ErrorLayoutComponent,
    RightSidebarComponent,
    FullscreenDirective,
    ToggleThemeDirective,
    HoverEffectSidebarDirective,
    SidemenuToggleDirective,
    HeaderSwitcherComponent,
    SearchComponentComponent,
    ChatbotComponent,
    PaginationComponent,
    ClickToCopyDirective,
    ZautoLayoutComponent,
    DashCardComponent,
    DashChartComponent,
    DateRangeSelectionComponent,
    LiveScrollDirective,
    DashListComponent,
    MomentPipe,
    ImageGeneratorDirective,
    MarkdownDirective,
    LeadPipe,
    


  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgScrollbar,
    NgSelectModule,
    MarkdownModule.forRoot(),
    HttpClientModule,
    CountUpModule,
    NgApexchartsModule,
    WidgetsModule,
    NgxSkeletonLoaderModule.forRoot(
      {
        theme: {
          extendsFromRoot: true,
          'background-color': 'var(--primary-1)'
        }
      }
    ),
    DataTableModule,
    ComponentsModule

  ],
  exports: [
    PageHeaderComponent,
    TabToTopComponent,

    ContentLayoutComponent,
    ErrorLayoutComponent,
    LoaderComponent,
    SidebarComponent,

    ToggleThemeDirective,
    SidemenuToggleDirective,

    ChatbotComponent,

    PaginationComponent,
    ClickToCopyDirective,

    ZautoLayoutComponent,

    DashCardComponent,
    DashChartComponent,
    DashListComponent,
    DateRangeSelectionComponent,
    LiveScrollDirective,
    MomentPipe,
    ImageGeneratorDirective,
    MarkdownDirective,
    LeadPipe,
    DataTableModule
  ],

  providers: [
    LoaderService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AgentInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AvatarInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    },
  ],

})
export class SharedModule { }
