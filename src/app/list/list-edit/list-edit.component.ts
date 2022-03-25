import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ListService} from "../../service/list.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {List} from "../../model/list.model";
import {DataStorageService} from "../../service/data-storage.service";
import {User} from "../../model/user.model";
import {NzMessageService} from "ng-zorro-antd/message";
import {ValidatorsService} from "../../service/validators.service";
import {WorkspaceService} from "../../service/workspace.service";
import {Subscription} from "rxjs";
import {SidebarService} from "../../service/sidebar.service";
import {SideList} from "../../model/sideList.model";

@Component({
  selector: 'app-list-edit',
  templateUrl: './list-edit.component.html',
  styleUrls: ['./list-edit.component.css']
})
export class ListEditComponent implements OnInit ,OnDestroy{
  private workspaceIdChangedSub: Subscription;

  @Input() isVisible = false;
  @Input() editList: List;
  @Input() editListIndex: number;
  @Input() currentUser: User;
  @Output() invisible = new EventEmitter<void>();
  isOkLoading = false;

  @Input() workspaceId: number = 0;
  validateForm!: FormGroup;


  constructor(private listService: ListService,
              private formBuilder: FormBuilder,
              private dataStorageService: DataStorageService,
              private workspaceService: WorkspaceService,
              private sidebarService: SidebarService,
              private message: NzMessageService,
              private validatorsService: ValidatorsService) { }

  ngOnInit(): void {
    this.validateForm = this.formBuilder.group({
      listName: [null, [Validators.required],[this.validatorsService.nameAsyncValidator]]
    });
  }

  ngOnDestroy(): void {
    this.workspaceIdChangedSub?.unsubscribe();
  }

  handleCancel(): void {
    this.isVisible = false;
    this.invisible.emit();
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.isOkLoading = true;
      this.dataStorageService.patchList(this.editList,+this.currentUser.id,true,false,null,this.workspaceId).subscribe(value => {
          if (this.workspaceId == 0){
            this.listService.editListById(this.editList.id,this.editList.name,this.editList.done);
          }else {
            this.sidebarService.editSideList(new SideList(this.editList.id,this.editList.name));
            this.workspaceService.editSharedList(this.editList,this.workspaceId);
          }
          this.resetSubmit();
        },
        errorMessage => {
          this.message.create('error',errorMessage);
          this.resetSubmit();
        });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  private resetSubmit() {
    this.isOkLoading = false;
    this.isVisible = false;
    this.invisible.emit();
  }
}
