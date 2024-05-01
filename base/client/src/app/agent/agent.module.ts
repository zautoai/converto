import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';


import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AgentComponent } from './agent/agent.component';
import { agentRoutingModule } from './agent-routing.module';
import { WidgetsModule } from '../widgets/widgets.module';


@NgModule({
  declarations: [
    AgentComponent

  ],
  imports: [
    CommonModule,
    agentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgScrollbarModule,
    WidgetsModule
  ],
  exports:[
    AgentComponent
  ]
})
export class agentModule { }
