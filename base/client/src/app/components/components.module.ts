import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvancedInputComponent } from './advanced-inputs/advanced-input/advanced-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AdvancedButtonComponent } from './advanced-inputs/advanced-button/advanced-button.component';



@NgModule({
  declarations: [
    AdvancedInputComponent,
    AdvancedButtonComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    AdvancedInputComponent,
    AdvancedButtonComponent
  ]
})
export class ComponentsModule { }
