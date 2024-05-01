import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmbedderComponent } from './embedder/embedder.component';

const routes: Routes = [
  {
    path: ':id',title: "Agent", component: EmbedderComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmbedderRoutingModule { }
