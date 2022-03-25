import {Component, EventEmitter, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Task} from "../../model/task.model";
import {NzMessageService} from "ng-zorro-antd/message";
import {DataStorageService} from "../../service/data-storage.service";
import {AuthService} from "../../service/auth.service";
import {Subscription} from "rxjs";
import {User} from "../../model/user.model";
import {TaskService} from "../../service/task.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {SidebarService} from "../../service/sidebar.service";
import {WorkspaceService} from "../../service/workspace.service";
import {ListService} from "../../service/list.service";

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit,OnDestroy{
  private tasksChangeSub: Subscription;
  private listsRemovedSub: Subscription;
  private workspaceDeletedSub: Subscription;
  private paramsSub: Subscription;
  private userSub: Subscription;
  private isAddSub: Subscription;

  workspaceId: number = 0;
  currentUser: User;
  currentListId: number;

  modalIsVisible: boolean = false;
  detailModalIsVisible: boolean = false;
  isAdd = new EventEmitter<Task>();
  isClearDoneLoading: boolean;
  isLoading: boolean;
  isRemoveLoading: boolean;

  tasks: Task[];
  taskDetail: Task;
  removeId: number;
  taskIndex: number;

  constructor(public msg: NzMessageService,
              private taskService: TaskService,
              private dataStorageService:DataStorageService,
              private listService: ListService,
              private sidebarService: SidebarService,
              private workspaceService: WorkspaceService,
              private authService:AuthService,
              private message: NzMessageService,
              private route: ActivatedRoute,
              private router: Router,
              private zone: NgZone) {
  }

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe();
    this.tasksChangeSub.unsubscribe();
    this.listsRemovedSub?.unsubscribe();
    this.workspaceDeletedSub?.unsubscribe();
    this.userSub.unsubscribe();
    this.isAddSub.unsubscribe();
  }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user=>{
      this.currentUser = user;
    });

    if (!!this.currentUser) {
      this.isLoading = true;
      this.paramsSub = this.route.params.subscribe(
        (params: Params)=> {
          this.currentListId = +params['id'];
          this.isAddSub = this.taskService.isAddTask.subscribe( value => {
            if (this.currentListId == value[1]){
              this.zone.run( ()=> {
                this.taskService.addTask(value[0]);
              });
            }
          });
          this.workspaceId = +params['workId'];
          this.workspaceDeletedSub = this.workspaceService.workspaceDeleted.subscribe( id => {
            this.zone.run( () => {
              if (this.workspaceId == id){
                this.router.navigate(['lists']);
              }
            });
          });
          this.isLoading = true;
          this.dataStorageService.fetchTasks(this.currentListId,this.workspaceId,+this.currentUser.id).subscribe(tasks => {
            this.taskService.setTasks(tasks);
            this.isLoading = false;
            this.listsRemovedSub = this.listService.listsRemoved.subscribe( ids => {
              let listIndex = ids.findIndex( id => {
                return id == this.currentListId;
              });
              this.zone.run( ()=> {
                if (listIndex > -1){
                  this.onBack();
                }
              });
            });
          },
            errorMessage => {
              this.message.create('error', errorMessage);
              this.isLoading = false;
            });
          if (this.workspaceId == 0){
            this.tasksChangeSub = this.taskService.tasksChanged.subscribe(
              (tasks: Task[]) => {
                this.zone.run( () => {
                  this.tasks = tasks;
                  this.sidebarService.setSideListTasks(tasks, this.currentListId);
                });
              }
            );
          }else {
            this.tasksChangeSub = this.taskService.tasksChanged.subscribe(
              (tasks: Task[]) => {
                this.zone.run( () => {
                  this.tasks = tasks;
                  this.workspaceService.setSharedTasks(tasks,this.workspaceId,this.currentListId);
                });
              }
            );
          }
        }
      );
    }
  }

  onBack() {
    if (this.workspaceId != 0){
      this.router.navigate(['/workspaces/'+this.workspaceId]);
    }else {
      this.router.navigate(['/lists']);
    }
  }

  onShowAddModal() {
    this.modalIsVisible = true;
    this.isAdd.emit(null);
  }

  onShowEditModal(task: Task, i: number) {
    this.modalIsVisible = true;
    this.taskIndex = i;
    task.name = TaskComponent.trim(task.name);
    let taskItem = new Task(task.id,task.name,task.content,task.startTime,task.endTime,task.done)
    this.isAdd.emit(taskItem);
  }

  onCloseModel() {
    this.modalIsVisible = false;
  }

  onClearDone() {
    this.isClearDoneLoading = true;
    this.dataStorageService.deleteTasks(this.taskService.selectTasks,+this.currentUser.id,this.workspaceId).subscribe(
      value => {
        this.taskService.selectTasks.forEach( task => {
          this.taskService.removeTaskById(task.id);
        });
        this.isClearDoneLoading = false;
      },
      errorMessage => {
        this.message.create('error',errorMessage);
        this.isClearDoneLoading = false;
      }
    )
  }

  onAllChecked(value: boolean):void {
    this.dataStorageService.patchTask(null,this.currentListId,false,true,value,+this.currentUser.id,this.workspaceId).subscribe(
      value1 => {},
      errorMessage => {
        this.message.create('error',errorMessage);
      });
    this.taskService.toggleAll = value;
  }

  onItemChecked(task: Task) {
    this.dataStorageService.patchTask(task,this.currentListId,false,false,null,+this.currentUser.id,this.workspaceId).subscribe(
      value => {},
      errorMessage => {
        this.message.create('error',errorMessage);
      });
    this.taskService.selectDone(task.id,!task.done);
  }

  onRemoveList(task: Task, i: number) {
    this.removeId = task.id;
    this.isRemoveLoading = true;
    this.dataStorageService.deleteTasks([task],+this.currentUser.id,this.workspaceId).subscribe(
      value => {
        this.taskService.removeTaskById(task.id);
        this.isRemoveLoading = false;
      },
      errorMessage => {
        this.message.create('error',errorMessage);
        this.isRemoveLoading = false;
      }
    )
  }

  get toggleAll () {
    return this.taskService.toggleAll;
  }

  get toggleSome () {
    return this.taskService.toggleSome;
  }

  get selectTaskCount () {
    return this.taskService.selectTasks.length;
  }

  public static trim(str:string){
    const reg = /^\s+|\s+$/g;
    return str.replace(reg,'');
  }


  onShowDetailModal(task:Task) {
    this.detailModalIsVisible = true;
    this.taskDetail = task;
  }

  onCloseDetailModal() {
    this.detailModalIsVisible = false;
  }

}
