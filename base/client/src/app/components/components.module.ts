import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvancedInputComponent } from './advanced-inputs/advanced-input/advanced-input.component';
import { AdvancedModalsComponent } from './advanced-modals/advanced-modals/advanced-modals.component';



@NgModule({
  declarations: [
    AdvancedInputComponent,
    AdvancedModalsComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [AdvancedModalsComponent]
})
export class ComponentsModule { }
