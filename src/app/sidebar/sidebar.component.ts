import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {AuthService} from "../service/auth.service";
import {TaskService} from "../service/task.service";
import {SidebarService} from "../service/sidebar.service";
import {SideList} from "../model/sideList.model";
import {DataStorageService} from "../service/data-storage.service";
import {User} from "../model/user.model";
import {Router} from "@angular/router";
import {Task} from "../model/task.model";
import {Workspace} from "../model/workspace.model";
import {WorkspaceService} from "../service/workspace.service";
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit,OnDestroy{
  private sideListsChangedSub: Subscription;
  private userSub: Subscription;
  private closeDetailModalSub: Subscription;
  private workspacesChangedSub: Subscription;

  isShowModal:boolean = false;
  isAuthenticated:boolean = false;
  currentUser: User;
  sideLists: SideList[];
  workspaces: Workspace[];
  selectTaskId: number = 0;
  selectWorkspaceId: number = 0;
  selectSharedSideTaskId: number = 0;

  constructor(private authService: AuthService,
              private taskService: TaskService,
              private sidebarService: SidebarService,
              private workspaceService: WorkspaceService,
              private message: NzMessageService,
              private router: Router,
              private dataStorageService: DataStorageService,
              private zone: NgZone) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user=>{
      this.isAuthenticated = !!user;
      this.currentUser = user;
      if (this.isAuthenticated){
        this.dataStorageService.fetchLists(+this.currentUser?.id).subscribe(lists => {
          let sideLists: SideList[]= [];
          lists.forEach((list,index) => {
            let sideList = new SideList(list.id,list.name);
            sideList.workspaceId = list.workspaceId;
            sideLists[index] = sideList;
          })
          this.sidebarService.setSideLists(sideLists);
        },
          errorMessage => {
            this.message.create('error',errorMessage);
          });
        this.sideListsChangedSub = this.sidebarService.sideListsChanged.subscribe(
          (sideLists:SideList[]) => {
            this.zone.run( () => {
              this.sideLists = sideLists;
            });
          }
        );
        this.dataStorageService.fetchWorkspaces(+this.currentUser?.id).subscribe(workspaces => {
           this.workspaceService.setWorkspaces(workspaces);
        },
          errorMessage => {
            this.message.create('error',errorMessage);
          });
        this.workspacesChangedSub = this.workspaceService.workspacesChanged.subscribe(
          workspaces => {
            this.zone.run( () => {
              this.workspaces = workspaces;
            });
          }
        );
      }
    })

    this.closeDetailModalSub = this.sidebarService.closeDetailModal.subscribe(value => {
      this.isShowModal = value;
    })
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.sideListsChangedSub.unsubscribe();
    this.closeDetailModalSub.unsubscribe();
    this.workspacesChangedSub.unsubscribe();
  }

  onOpenTask(id: number,workId: number) {
    if (!!workId) {
      this.selectSharedSideTaskId = id;
      this.router.navigate(['lists/'+id+'/tasks/'+workId]);
    }else{
      this.selectTaskId = id;
      this.router.navigate(['lists/'+id+'/tasks/0']);
    }
  }

  onShowDetailModal(task: Task) {
    this.sidebarService.showDetailModal.next([!this.isShowModal,task]);
  }

  onOpenWorkspace(id: number) {
    this.selectWorkspaceId = id;
    this.router.navigate(['workspaces/'+id]);
  }

  onOpenList() {
    this.router.navigate(['lists']);
  }
}
