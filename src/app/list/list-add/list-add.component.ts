import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ListService} from "../../service/list.service";
import {List} from "../../model/list.model";
import {formatNumber} from "@angular/common";

@Component({
  selector: 'app-list-add',
  templateUrl: './list-add.component.html',
  styleUrls: ['./list-add.component.css']
})
export class ListAddComponent implements OnInit {

  @Input() isVisible = false;
  @Output() invisible = new EventEmitter<void>();
  isOkLoading = false;

  newLists: List[];
  validateForm!: FormGroup;
  listOfControl: Array<{ id: number; controlInstance: string }> = [];

  constructor(private fb: FormBuilder,private listService: ListService) { }

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
      new FormControl(null, Validators.required)
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
    console.log(1,this.validateForm.valid);
    if (this.validateForm.valid) {
      let lastList = this.listService.lists[this.listService.lists.length - 1];
      let lastListId = lastList ? lastList.id : 1;
      this.newLists = Object.values(this.validateForm.value).map(
        (element:string,index:number) => {
          return new List(lastListId+1+index,element,false)
        }
      );
      this.listService.addList(this.newLists);
      this.isOkLoading = true;
      this.isVisible = false;
      this.invisible.emit();
      this.isOkLoading = false;
      this.listOfControl.forEach(value =>{
        this.validateForm.removeControl(value.controlInstance);
      });
      this.listOfControl = [];
      this.addField();
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
}
