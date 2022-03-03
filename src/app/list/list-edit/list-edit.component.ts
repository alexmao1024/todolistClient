import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ListService} from "../../service/list.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {List} from "../../model/list.model";
import {DataStorageService} from "../../service/data-storage.service";
import {User} from "../../model/user.model";

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
              private dataStorageService: DataStorageService) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      listName: [null, [Validators.required]]
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
    console.log(this.validateForm.valid);
    if (this.validateForm.valid) {
      this.isOkLoading = true;
      this.dataStorageService.patchList(this.editList,+this.currentUser.id,true).subscribe(value => {
        this.listService.editList(this.editList,this.editListIndex);
        this.isOkLoading = false;
        this.isVisible = false;
        this.invisible.emit();
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
}
