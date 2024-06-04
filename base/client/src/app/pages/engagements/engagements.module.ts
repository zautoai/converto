import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EngagementsRoutingModule } from './engagements-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgScrollbar } from 'ngx-scrollbar';
import { ComponentsModule } from 'src/app/components/components.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ContactCardComponent } from './contacts/components/contact-card/contact-card.component';
import { ContactPreviewComponent } from './contacts/components/contact-preview/contact-preview.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AccountCardComponent } from './account/components/account-card/account-card.component';
import { AccountPreviewComponent } from './account/components/account-preview/account-preview.component';
import { AccountsComponent } from './account/account.component';


@NgModule({
  declarations: [
    ContactCardComponent,
    ContactPreviewComponent,
    ContactsComponent,
    AccountCardComponent,
    AccountPreviewComponent,
    AccountsComponent
  ],
  imports: [
    CommonModule,
    EngagementsRoutingModule,
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
export class EngagementsModule { }
