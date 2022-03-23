import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { registerLocaleData } from '@angular/common';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import {ListService} from "./service/list.service";
import {ListComponent} from "./list/list.component";
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import {NzMessageService} from "ng-zorro-antd/message";
import { SidebarComponent } from './sidebar/sidebar.component';
import { ListAddComponent } from './list/list-add/list-add.component';
import { ListEditComponent } from './list/list-edit/list-edit.component';
import { AuthComponent } from './header/auth/auth.component';
import { HostComponent } from './host/host.component';
import {AuthInterceptorService} from "./header/auth/auth-interceptor.service";
import { TaskComponent } from './list/task/task.component';
import {TaskService} from "./service/task.service";
import { TaskAddEditComponent } from './list/task/task-add-edit/task-add-edit.component';
import { TaskDetailComponent } from './list/task/task-detail/task-detail.component';
import {SidebarService} from "./service/sidebar.service";
import {NZ_I18N, zh_CN} from "ng-zorro-antd/i18n";
import zh from '@angular/common/locales/zh';
import { WorkspaceComponent } from './workspace/workspace.component';
import { AddWorkspaceComponent } from './list/add-workspace/add-workspace.component';
import { ListsSharedComponent } from './list/lists-shared/lists-shared.component';
import { WorkspaceManagerComponent } from './header/workspace-manager/workspace-manager.component';



registerLocaleData(zh);

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    ListAddComponent,
    ListEditComponent,
    AuthComponent,
    HostComponent,
    TaskComponent,
    TaskAddEditComponent,
    TaskDetailComponent,
    WorkspaceComponent,
    AddWorkspaceComponent,
    ListsSharedComponent,
    WorkspaceManagerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NzButtonModule,
    NzLayoutModule,
    NzBreadCrumbModule,
    NzMenuModule,
    NzListModule,
    NzSpaceModule,
    NzPageHeaderModule,
    NzDropDownModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,
    NzCascaderModule,
    NzSelectModule,
    NzCheckboxModule,
    NzTableModule,
    NzSpinModule,
    NzPopconfirmModule,
    NzAvatarModule,
    NzGridModule,
    NzTypographyModule,
    NzDatePickerModule,
    NzDrawerModule,
    NzDescriptionsModule,
    NzSwitchModule,
    NzTransferModule,
    ReactiveFormsModule,
    NzMessageModule
  ],
  providers: [
    { provide: NZ_I18N, useValue: zh_CN },
    ListService,
    TaskService,
    SidebarService,
    NzMessageService,
    FormBuilder,
    FormControl,
    Validators,
    {
      provide:HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi:true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
