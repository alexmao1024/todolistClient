import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ListService} from "../../service/list.service";
import {FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {List} from "../../model/list.model";
import {DataStorageService} from "../../service/data-storage.service";
import {User} from "../../model/user.model";
import {NzMessageService} from "ng-zorro-antd/message";
import {Observable, Observer} from "rxjs";
import {ValidatorsService} from "../../service/validators.service";

@Component({
  selector: 'app-list-edit',
  templateUrl: './list-edit.component.html',
  styleUrls: ['./list-edit.component.css']
})
export class ListEditComponent implements OnInit {
  @Input() isVisible = false;
  @Input() editList: List;
  @Input() editListIndex: number;
  @Input() currentUser: User;
  @Output() invisible = new EventEmitter<void>();
  isOkLoading = false;
  validateForm!: FormGroup;


  constructor(private listService: ListService,
              private fb: FormBuilder,
              private dataStorageService: DataStorageService,
              private message: NzMessageService,
              private validatorsService: ValidatorsService) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      listName: [null, [Validators.required],[this.validatorsService.nameAsyncValidator]]
    });
  }

  handleCancel(): void {
    this.isVisible = false;
    this.invisible.emit();
    if (!this.validateForm.valid)
    {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.isOkLoading = true;
      this.dataStorageService.patchList(this.editList,+this.currentUser.id,true,false,null).subscribe(value => {
          this.listService.editList(this.editList,this.editListIndex);
          this.resetSubmit();
      },
        errorMessage => {
          this.message.create('error',errorMessage);
          this.resetSubmit();
        })
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
