import { Routes } from "@angular/router";

export const Content_Routes: Routes = [
  {
    path: '',
    loadChildren: () => import('../../components/custompages/custompages.module').then(m => m.CustompagesModule)
  },
];
