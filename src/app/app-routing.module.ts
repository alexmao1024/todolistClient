import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HostComponent} from "./host/host.component";
import {ListComponent} from "./list/list.component";
import {AuthGuard} from "./header/auth/auth.guard";
import {TaskComponent} from "./list/task/task.component";
import {HostGuard} from "./host/host.guard";
import {WorkspaceComponent} from "./workspace/workspace.component";

const routes: Routes = [
  { path: '', redirectTo: '/host', pathMatch: 'full'},
  {
    path: 'host',
    component: HostComponent,
    canActivate: [HostGuard]
  },
  {
    path: 'lists',
    component: ListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'lists/:id/tasks/:workId',
    component: TaskComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'workspaces/:id',
    component: WorkspaceComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
