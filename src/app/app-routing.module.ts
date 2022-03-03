import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HostComponent} from "./host/host.component";
import {ListComponent} from "./list/list.component";
import {AuthGuard} from "./header/auth/auth.guard";

const routes: Routes = [
  { path: '', redirectTo: '/host', pathMatch: 'full'},
  {
    path: 'host',
    component: HostComponent
  },
  {
    path: 'lists',
    component: ListComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
