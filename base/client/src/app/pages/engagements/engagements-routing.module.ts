import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactsComponent } from './contacts/contacts.component';
import { SetupGuard } from 'src/app/shared/guard/setup.guard';
import { AccountsComponent } from './account/account.component';

const routes: Routes = [
  {
    path: 'contacts/:id',
    title: "Contacts",
    component: ContactsComponent,
    canActivate: [SetupGuard]
  },
  {
    path: 'contacts',
    redirectTo: 'contacts/all',
    pathMatch: 'full'
  },
  {
    path: 'account/:id',
    title: "accounts",
    component: AccountsComponent,
    canActivate: [SetupGuard]
  },

  {
    path: 'accounts',
    redirectTo: "account/all",
  pathMatch:'full'
  },
 



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EngagementsRoutingModule { }
