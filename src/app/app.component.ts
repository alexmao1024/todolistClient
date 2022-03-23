import {Component, OnDestroy} from '@angular/core';
import {AuthService} from "./service/auth.service";
import {Subscription} from "rxjs";
import {ListService} from "./service/list.service";
import {List} from "./model/list.model";
import {SideList} from "./model/sideList.model";
import {SidebarService} from "./service/sidebar.service";
import {WorkspaceService} from "./service/workspace.service";
import {User} from "./model/user.model";
import {TaskService} from "./service/task.service";
import {Task} from "./model/task.model";
import {Workspace} from "./model/workspace.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy{
  private listSynchronisationSub: Subscription;
  private taskSynchronisationSub: Subscription;
  private workspaceSynchronisationSub: Subscription;
  private userSub: Subscription;
  private currentUser: User;

  constructor(private authService: AuthService,
              private listService: ListService,
              private taskService: TaskService,
              private sidebarService: SidebarService,
              private workspaceService: WorkspaceService) {
  }


  ngOnInit(): void {
    this.authService.autoLogin();
    this.listSynchronisationSub = this.listService.synchronisationEvent.subscribe( data => {
      this.handleListSynchronizedData(data);
    });
    this.taskSynchronisationSub = this.taskService.synchronisationEvent.subscribe( data => {
      this.handleTaskSynchronizedData(data);
    });
    this.workspaceSynchronisationSub = this.workspaceService.synchronisationEvent.subscribe( data => {
      this.handleWorkspaceSynchronizedData(data);
    });
    this.userSub = this.authService.user.subscribe(user=>{
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.listSynchronisationSub.unsubscribe();
    this.taskSynchronisationSub.unsubscribe();
    this.workspaceSynchronisationSub.unsubscribe();
    this.userSub?.unsubscribe();
  }

  handleListSynchronizedData(data:any) {
    if (data.type == 'create'){
      let listNames = data.lists;
      let listIds = data.ids;
      let newLists:List[] = [];
      let sideLists:SideList[] = [];
      listNames.forEach( (listName,index) => {
        newLists.push(new List(listIds[index],listName,false));
        sideLists.push(new SideList(listIds[index],listName));
      });
      if (data.userId == +this.currentUser.id){
        this.listService.addLists(newLists);
        if (data.workId != 0){
          this.sidebarService.addSideLists(sideLists);
        }
      }
      this.workspaceService.addSharedLists(newLists,data.workId);
      this.workspaceService.addSharedSideLists(sideLists,data.workId);

    }else if (data.type == 'delete'){
      this.listService.listsRemoved.next(data.ids);
      data.ids.forEach( (id,index) => {
        this.sidebarService.removeSideList(id);
        this.listService.removeListById(id);
        this.workspaceService.removeSharedList(id,data.workIds[index]);
      });
    }else if (data.type == 'update'){
      if (data.name){
        let list = new List(data.id,data.name,data.done);
        let editSideList = new SideList(data.id,data.name);
        editSideList.workspaceId = data.workId;
        this.sidebarService.editSideList(editSideList);
        this.listService.editListById(list.id,list.name,list.done);
        this.workspaceService.editSharedList(list,data.workId);
      }else {
        this.listService.selectDone(data.id,data.done);
      }
    }else if (data.type == 'updateAllDone'){
      data.listIds.forEach( id => {
        this.listService.selectDone(id,data.boolean);
      });
    }
  }

  handleTaskSynchronizedData(data:any) {
    if (data.type == 'create'){
      let newTask = new Task(
        data.id,
        data.name,
        data.content,
        data.startTime,
        data.endTime,
        false);
      this.taskService.isAddTask.next([newTask,data.listId,data.workId]);
    }else if (data.type == 'delete'){
      data.ids.forEach( id => {
        this.taskService.removeTaskById(id);
      });
    }else if (data.type == 'update'){
      if (data.name){
        let task = new Task(data.id,data.name,data.content,data.startTime,data.endTime,data.done);
        this.taskService.editTaskById(task);
        this.taskService.isEditTask.next(task);
      }else {
        this.taskService.selectDone(data.id,data.done);
      }
    }else if (data.type == 'updateAllDone'){
      data.taskIds.forEach( id => {
        this.taskService.selectDone(id,data.boolean);
      });
    }
  }

  handleWorkspaceSynchronizedData(data: any) {
    if (data.type == 'create') {
      let workspace = new Workspace(data.name,data.owner,data.sharedUsers);
      workspace.id = data.id;
      data.sharedUsers.forEach( sharedUsername => {
        if (this.currentUser.username == sharedUsername || this.currentUser.username == data.owner){
          this.workspaceService.addWorkspace(workspace);
        }
      });
    }else if (data.type == 'update') {
      if (data.name){
        this.workspaceService.editWorkspaceName(data.name,data.id);
      }else{
        let listNames = data.listNames;
        let listDones = data.listDones;
        let listIds = data.ids;
        let newLists:List[] = [];
        let sideLists:SideList[] = [];
        listNames.forEach( (listName,index) => {
          newLists.push(new List(listIds[index],listName,listDones[index]));
          sideLists.push(new SideList(listIds[index],listName));
        });
        if (data.innerType == 'addLists' && data.ids.length > 0) {
          if (data.id != 0){
            this.sidebarService.addSideLists(sideLists);
          }
          this.workspaceService.addSharedLists(newLists,data.id);
          this.workspaceService.addSharedSideLists(sideLists,data.id);
        }else if (data.innerType == 'removeLists' && data.ids.length > 0) {
          this.listService.listsRemoved.next(data.ids);
          this.workspaceService.removeSharedLists(newLists,data.id);
        }else if (data.innerType == 'addUsers') {
          this.workspaceService.addSharedUsers(data.names,data.id);
          data.names.forEach( name => {
            if (this.currentUser.username == name){
              let workspace = new Workspace(data.originName,data.owner,data.afterUsers);
              workspace.id = data.id;
              let sharedLists:List[] = [];
              let sideLists:SideList[] = [];
              data.ids.forEach( (id,index) => {
                sharedLists.push(new List(id,data.listNames[index],data.listDones[index]));
                sideLists.push(new SideList(id,data.listNames[index]));
              });
              workspace.sharedLists = sharedLists;
              workspace.sharedSideLists = sideLists;
              this.workspaceService.addWorkspace(workspace);
            }
          });
        }else if (data.innerType == 'removeUsers') {
          this.workspaceService.workspaceDeleted.next(data.id);
          this.workspaceService.removeSharedUsers(data.names, data.id);
          data.names.forEach( name => {
            if (this.currentUser.username == name){
              this.workspaceService.removeWorkspace(data.id);
            }
          });
        }
      }
    }else if (data.type == 'delete') {
      this.workspaceService.workspaceDeleted.next(data.id);
      this.workspaceService.removeWorkspace(data.id);
    }
  }
}
