import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvancedInputComponent } from './advanced-inputs/advanced-input/advanced-input.component';
import { AdvancedModalsComponent } from './advanced-modals/advanced-modals/advanced-modals.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AdvancedButtonComponent } from './advanced-inputs/advanced-button/advanced-button.component';
import { AdvanceOffcanvasComponent } from './advance-offcanvas/advance-offcanvas.component';



@NgModule({
  declarations: [
    AdvancedInputComponent,
    AdvancedModalsComponent,
    AdvancedButtonComponent,
    AdvanceOffcanvasComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    AdvancedInputComponent,
    AdvancedButtonComponent,
    AdvancedModalsComponent,
    AdvanceOffcanvasComponent
  ]
})
export class ComponentsModule { }
