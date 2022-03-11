import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {ListService} from "../../service/list.service";
import {List} from "../../model/list.model";
import {DataStorageService} from "../../service/data-storage.service";
import {User} from "../../model/user.model";
import {NzMessageService} from "ng-zorro-antd/message";
import {Observable, Observer} from "rxjs";
import {ValidatorsService} from "../../service/validators.service";

@Component({
  selector: 'app-list-add',
  templateUrl: './list-add.component.html',
  styleUrls: ['./list-add.component.css']
})
export class ListAddComponent implements OnInit {

  @Input() isVisible = false;
  @Input() currentUser: User;
  @Output() invisible = new EventEmitter<void>();
  isOkLoading = false;

  newLists: List[];
  validateForm!: FormGroup;
  listOfControl: Array<{ id: number; controlInstance: string }> = [];

  constructor(private fb: FormBuilder,
              private listService: ListService,
              private dataStorageService: DataStorageService,
              private message: NzMessageService,
              private validatorsService: ValidatorsService) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({});
    this.addField();
  }

  handleCancel(): void {
    this.isVisible = false;
    this.invisible.emit();
    this.listOfControl.forEach(value =>{
      this.validateForm.removeControl(value.controlInstance);
    });
    this.listOfControl = [];
    this.addField();
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
      this.dataStorageService.postLists(this.newLists,+this.currentUser.id).subscribe( value => {
        this.resetSubmit();
      },
        errorMessage => {
          this.message.create('error',errorMessage);
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
    this.isOkLoading = false;
    this.isVisible = false;
    this.invisible.emit();
    this.listOfControl.forEach(value =>{
      this.validateForm.removeControl(value.controlInstance);
    });
    this.listOfControl = [];
    this.addField();
  }
}
