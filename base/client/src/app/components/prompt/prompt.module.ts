import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';



import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgCircleProgressModule } from 'ng-circle-progress';



import { PromptComponent } from './prompt/prompt.component';
import { promptRoutingModule } from './prompt-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    PromptComponent

  ],
  imports: [
    CommonModule,
    promptRoutingModule,

    
    NgbModule,
    NgCircleProgressModule.forRoot(),
    
    NgScrollbarModule,
    
    SharedModule
  ]
})
export class promptModule { }
