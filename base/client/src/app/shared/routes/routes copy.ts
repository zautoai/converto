import { Routes } from '@angular/router';


export const content: Routes = [
  {
    path:'',
    loadChildren: () => import('../../pages/pages.module').then(m => m.PagesModule),
  },
]
