import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidatorsService} from "../../../service/validators.service";
import {DataStorageService} from "../../../service/data-storage.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {TaskService} from "../../../service/task.service";
import {Task} from "../../../model/task.model";
import {TaskComponent} from "../task.component";

@Component({
  selector: 'app-task-add-edit',
  templateUrl: './task-add-edit.component.html',
  styleUrls: ['./task-add-edit.component.css']
})
export class TaskAddEditComponent implements OnInit {
  @Input() isAddEvent;
  @Input() isVisible = false;
  @Input() currentListId : number;
  @Input() currentUserId : number;
  @Input() currentWorkspaceId : number = 0;
  @Input() editTaskIndex: number;
  @Output() invisible = new EventEmitter<void>();
  isOkLoading: boolean;

  isAdd:boolean;
  editTask:Task;
  validateForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private validatorsService:ValidatorsService,
              private dataStorageService: DataStorageService,
              private taskService: TaskService,
              private message: NzMessageService) { }

  ngOnInit(): void {
    this.validateForm = this.formBuilder.group({
      name: [null, [Validators.required],[this.validatorsService.nameAsyncValidator]],
      content: [null, [Validators.pattern(/^.{0,255}$/)]],
      dateTimeRange: [[]]
    });
    this.isAddEvent.subscribe(
      editTask => {
        this.isAdd = !editTask;
        this.editTask = editTask;
        let startTime = (editTask?.startTime??null) ? new Date(this.editTask.startTime): null;
        let endTime = (editTask?.endTime??null) ? new Date(this.editTask.endTime): null;
        this.validateForm = this.formBuilder.group({
          name: [this.editTask?.name??null, [Validators.required],[this.validatorsService.nameAsyncValidator]],
          content: [this.editTask?.content??null, [Validators.pattern(/^.{0,255}$/)]],
          dateTimeRange: [startTime?[startTime,endTime]:[]]
        });
        });
  }

  handleCancel() {
    this.isVisible = false;
    this.invisible.emit();
    this.resetSubmit();
    Object.values(this.validateForm.controls).forEach(control => {
      if (control.invalid) {
        control.updateValueAndValidity({ onlySelf: true });
      }
    });

  }

  submitForm() {
    if (this.isAdd){
      this.addTaskFn();
    }else {
      this.editTaskFn()
    }
  }

  private resetSubmit() {
    this.isOkLoading = false;
    this.isVisible = false;
    this.invisible.emit();
    this.validateForm.reset();
  }

  private addTaskFn() {
    if (this.validateForm.valid) {
      this.isOkLoading = true;
      let newTask = new Task(
        null,
        TaskComponent.trim(this.validateForm.value.name),
        this.validateForm.value.content,
        this.validateForm.value.dateTimeRange[0]?.toLocaleString()?? null,
        this.validateForm.value.dateTimeRange[1]?.toLocaleString()?? null,
        false
      );
      this.dataStorageService.postTasks(newTask,this.currentListId,this.currentUserId,this.currentWorkspaceId).subscribe(resTasks => {
          this.taskService.addTask(resTasks);
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

  private editTaskFn() {
    if (this.validateForm.valid) {
      this.isOkLoading = true;
      this.editTask.name = this.validateForm.value.name;
      this.editTask.content = this.validateForm.value.content;
      this.editTask.startTime = this.validateForm.value.dateTimeRange[0]?.toLocaleString()?? null;
      this.editTask.endTime =this.validateForm.value.dateTimeRange[1]?.toLocaleString()?? null;
      this.dataStorageService.patchTask(this.editTask,this.currentListId,true,false,null,this.currentUserId,this.currentWorkspaceId).subscribe(value => {
          this.taskService.editTask(this.editTask,this.editTaskIndex);
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
}
