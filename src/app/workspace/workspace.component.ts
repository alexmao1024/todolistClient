import {ChangeDetectorRef, Component, EventEmitter, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Workspace} from "../model/workspace.model";
import {WorkspaceService} from "../service/workspace.service";
import {Subscription} from "rxjs";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {AuthService} from "../service/auth.service";
import {User} from "../model/user.model";
import {DataStorageService} from "../service/data-storage.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {ListService} from "../service/list.service";
import {TaskService} from "../service/task.service";

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})

export class WorkspaceComponent implements OnInit ,OnDestroy {
  workspaces: Workspace[];
  private workspacesChangedSub: Subscription;
  private userSub: Subscription;

  currentUser: User;
  currentWorkspaceId: number = 0;
  currentWorkspaceOwner: string;

  isFetch = new EventEmitter<boolean>();

  constructor(private workspaceService: WorkspaceService,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private dataStorageService: DataStorageService,
              private taskService: TaskService,
              private message: NzMessageService,
              private listService: ListService,
              private cDRef: ChangeDetectorRef,
              private zone: NgZone) {}

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      this.currentUser = user;
    });
    if (!!this.currentUser) {
      this.route.params.subscribe(
        (params: Params) => {
          this.currentWorkspaceId = +params['id'];
          this.isFetch.emit(true);
          this.dataStorageService.fetchWorkspaces(+this.currentUser.id).subscribe(workspaces => {
              this.workspaces = workspaces;
              let index = this.workspaces.findIndex(workspace => {
                return workspace.id == this.currentWorkspaceId;
              });
              if (index > -1){
                let workspace = this.workspaces.find((value, i) => {
                  return index == i;
                });
                this.currentWorkspaceOwner = workspace.owner;
                this.listService.setLists(workspaces[index].sharedLists);
                this.isFetch.emit(false);
                this.workspacesChangedSub = this.workspaceService.workspacesChanged.subscribe(workspaces => {
                  this.workspaces = workspaces;
                  this.listService.setLists(workspaces[index]?.sharedLists);
                  this.cDRef.detectChanges();
                });
              }
            },
            errorMessage => {
              this.message.create('error', errorMessage);
            });
        });
    }
  }

  ngOnDestroy(): void {
    this.workspacesChangedSub?.unsubscribe();
    this.userSub.unsubscribe();
  }
}
