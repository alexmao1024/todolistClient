import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {ListService} from "../../service/list.service";
import {List} from "../../model/list.model";
import {DataStorageService} from "../../service/data-storage.service";
import {User} from "../../model/user.model";
import {NzMessageService} from "ng-zorro-antd/message";
import {ValidatorsService} from "../../service/validators.service";
import {SidebarService} from "../../service/sidebar.service";
import {SideList} from "../../model/sideList.model";
import {WorkspaceService} from "../../service/workspace.service";

@Component({
  selector: 'app-list-add',
  templateUrl: './list-add.component.html',
  styleUrls: ['./list-add.component.css']
})
export class ListAddComponent implements OnInit ,OnDestroy{
  @Input() isVisible = false;
  @Input() currentUser: User;
  @Output() invisible = new EventEmitter<void>();
  isOkLoading = false;

  @Input() workspaceId: number = 0;
  newLists: List[];
  validateForm!: FormGroup;
  listOfControl: Array<{ id: number; controlInstance: string }> = [];

  constructor(private formBuilder: FormBuilder,
              private listService: ListService,
              private dataStorageService: DataStorageService,
              private workspaceService: WorkspaceService,
              private sidebarService: SidebarService,
              private message: NzMessageService,
              private validatorsService: ValidatorsService) { }

  ngOnDestroy(): void {
    }

  ngOnInit(): void {
    this.validateForm = this.formBuilder.group({});
    this.addField();
  }

  handleCancel(): void {
    this.resetSubmit();
  }

  addField(e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }
    const id = this.listOfControl.length > 0 ? this.listOfControl[this.listOfControl.length - 1].id + 1 : 0;

    const control = {
      id,
      controlInstance: `list_${id}`
    };
    const index = this.listOfControl.push(control);
    this.validateForm.addControl(
      this.listOfControl[index - 1].controlInstance,
      new FormControl(null, [Validators.required],[this.validatorsService.nameAsyncValidator])
    );
  }

  removeField(i: { id: number; controlInstance: string }, e: MouseEvent): void {
    e.preventDefault();
    if (this.listOfControl.length > 1) {
      const index = this.listOfControl.indexOf(i);
      this.listOfControl.splice(index, 1);
      this.validateForm.removeControl(i.controlInstance);
    }
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.newLists = Object.values(this.validateForm.value).map(
        (element:string) => {
          return new List(null,element,false);
        }
      );
      this.isOkLoading = true;
      this.dataStorageService.postLists(this.newLists,+this.currentUser.id,this.workspaceId).subscribe( newLists => {
        let sideLists:SideList[] = [];
        newLists.forEach( list => {
          sideLists.push(new SideList(list.id,list.name));
        });
        if (this.workspaceId == 0){
          this.listService.addLists(newLists);
        }else {
          this.sidebarService.addSideLists(sideLists);
          this.workspaceService.addSharedLists(newLists,this.workspaceId);
          this.workspaceService.addSharedSideLists(sideLists,this.workspaceId);
        }
        this.isOkLoading = false;
        this.resetSubmit();
      },
        errorMessage => {
          this.message.create('error',errorMessage);
          this.isOkLoading = false;
          this.resetSubmit();
        });
    } else {
      this.setControlValid();
    }
  }

  private setControlValid () {
    Object.values(this.validateForm.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  private resetSubmit () {
    this.isVisible = false;
    this.invisible.emit();
    this.listOfControl.forEach(value =>{
      this.validateForm.removeControl(value.controlInstance);
    });
    this.listOfControl = [];
    this.addField();
  }
}
