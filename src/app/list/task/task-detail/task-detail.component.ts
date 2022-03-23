import {Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import {Task} from "../../../model/task.model";
import {SidebarService} from "../../../service/sidebar.service";
import {Subscription} from "rxjs";
import {TaskService} from "../../../service/task.service";

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit ,OnDestroy{
  @Input() isVisible: boolean;
  @Input() task: Task;
  @Output() invisible = new EventEmitter<void>();

  private showDetailModalSub: Subscription;
  private isEditTaskSub: Subscription;

  constructor(private sidebarService: SidebarService,
              private taskService: TaskService,
              private zone: NgZone) { }

  ngOnInit(): void {
    this.showDetailModalSub = this.sidebarService.showDetailModal.subscribe( value => {
      this.zone.run( () => {
        this.isVisible = value[0];
        this.task = value[1];
      });
    });
    this.isEditTaskSub = this.taskService.isEditTask.subscribe( task => {
      this.zone.run( () => {
        this.task = task;
      });
    });
  }

  onClose() {
    this.isVisible = false;
    this.sidebarService.closeDetailModal.next(this.isVisible);
    this.invisible.emit();
  }

  ngOnDestroy(): void {
    this.isEditTaskSub.unsubscribe();
    this.showDetailModalSub.unsubscribe();
  }
}
