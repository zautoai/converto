import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformLinkComponent } from './platform-link/platform-link.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    PlatformLinkComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports:[
    PlatformLinkComponent
  ]
})
export class PlatformLinkModule { }
