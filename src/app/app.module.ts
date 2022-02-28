import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { zh_CN } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
import {ListService} from "./service/list.service";
import {ListComponent} from "./list/list.component";
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import {NzMessageService} from "ng-zorro-antd/message";
import { SiderComponent } from './sider/sider.component';
import { ListAddComponent } from './list/list-add/list-add.component';
import { ListEditComponent } from './list/list-edit/list-edit.component';



registerLocaleData(zh);

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    HeaderComponent,
    FooterComponent,
    SiderComponent,
    ListAddComponent,
    ListEditComponent
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
    ReactiveFormsModule
  ],
  providers: [{ provide: NZ_I18N, useValue: zh_CN },ListService,NzMessageService,FormBuilder,FormControl,Validators],
  bootstrap: [AppComponent]
})
export class AppModule { }
