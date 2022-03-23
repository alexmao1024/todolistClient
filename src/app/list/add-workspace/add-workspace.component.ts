import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from "../../model/user.model";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {DataStorageService} from "../../service/data-storage.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {ValidatorsService} from "../../service/validators.service";
import {NzCascaderOption, NzCascaderOptionComponent} from "ng-zorro-antd/cascader";
import {Workspace} from "../../model/workspace.model";

@Component({
  selector: 'app-add-workspace',
  templateUrl: './add-workspace.component.html',
  styleUrls: ['./add-workspace.component.css']
})
export class AddWorkspaceComponent implements OnInit {
  @Input() isVisible = false;
  @Input() currentUser: User;
  @Output() invisible = new EventEmitter<void>();
  isOkLoading = false;
  validateForm!: FormGroup;
  nzOptions: NzCascaderOption[] = [];

  constructor(private formBuilder: FormBuilder,
              private dataStorageService: DataStorageService,
              private message: NzMessageService,
              private validatorsService: ValidatorsService) { }

  ngOnInit(): void {
    this.dataStorageService.fetchOtherUsers(+this.currentUser.id).subscribe( users =>{
      let options: Array<{ value: string; label: string }> = [];
      Object.values(users).forEach( user => {
        let option: { value: string; label: string } = {
          value: user.username,
          label: user.username
        };
        options.push(option);
      })
      this.nzOptions = options;
    },
      errorMessage => {
        this.message.create('error',errorMessage);
      })
    this.validateForm = this.formBuilder.group({
      workspaceName: [null, [Validators.required],[this.validatorsService.nameAsyncValidator]],
      sharedUserNames: [[],[Validators.required]]
    });
  }

  handleCancel() {
    this.isVisible = false;
    this.invisible.emit();
    this.validateForm.reset();
    Object.values(this.validateForm.controls).forEach(control => {
      if (control.invalid) {
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  submitForm() {
    if (this.validateForm.valid) {
      this.isOkLoading = true;
      let workspace = new Workspace(
        this.validateForm.value.workspaceName,
        this.currentUser.username,
        this.validateForm.value.sharedUserNames);
      this.dataStorageService.postWorkspace(workspace,+this.currentUser.id).subscribe( value => {
        this.isVisible = false;
        this.invisible.emit();
        this.validateForm.reset();
        this.isOkLoading = false;
      },
        errorMessage => {
          this.message.create('error',errorMessage);
          this.isVisible = false;
          this.invisible.emit();
          this.validateForm.reset();
          this.isOkLoading = false;
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

}
