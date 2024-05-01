import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmbedderRoutingModule } from './embedder-routing.module';
import { EmbedderComponent } from './embedder/embedder.component';
import { WidgetsModule } from 'src/app/widgets/widgets.module';


@NgModule({
  declarations: [
    EmbedderComponent
  ],
  imports: [
    CommonModule,
    EmbedderRoutingModule,
    WidgetsModule
  ]
})
export class EmbedderModule { }
