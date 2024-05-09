import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromptComponent } from './prompt/prompt.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'prompt', title: "Prompt", component: PromptComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class promptRoutingModule { }
