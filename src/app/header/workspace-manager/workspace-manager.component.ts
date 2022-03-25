import {Component, EventEmitter, Input, NgZone, OnInit} from '@angular/core';
import {DataStorageService} from "../../service/data-storage.service";
import {User} from "../../model/user.model";
import {Workspace} from "../../model/workspace.model";
import {WorkspaceService} from "../../service/workspace.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {ListComponent} from "../../list/list.component";
import {NzCascaderOption} from "ng-zorro-antd/cascader";
import {ActivatedRoute, Params, Router} from "@angular/router";

@Component({
  selector: 'app-workspace-manager',
  templateUrl: './workspace-manager.component.html',
  styleUrls: ['./workspace-manager.component.css']
})
export class WorkspaceManagerComponent implements OnInit {
  isVisible: boolean = false;
  @Input() isOpenEvent: EventEmitter<void>;
  @Input() currentUser: User;

  listOfSelectedValue: [] = [];

  workspaces: Workspace[] = [];
  nzOptions: NzCascaderOption[] = [];
  originOptions: NzCascaderOption[] = [];
  editId: number;
  originEditWorkspace: Workspace;
  editWorkspace: Workspace;
  editIndex: number;
  mgWorkspaceId: number;
  currentWorkspaceId: number;

  isMouseOut: boolean = false;
  isOkLoading: boolean = false;
  removeId: number;
  isRemoveLoading: boolean = false;
  isLoading: boolean = false;
  isUserMgVisible: boolean = false;
  isRemoveUsers: boolean;


  constructor(private dataStorageService: DataStorageService,
              private workspaceService: WorkspaceService,
              private message: NzMessageService,
              private router: Router,
              private zone: NgZone) { }

  ngOnInit(): void {
    this.isOpenEvent.subscribe( value => {
      if (this.router.url.split('/')[1] == 'workspaces'){
        this.currentWorkspaceId = +this.router.url.split('/')[2];
      }
      this.isVisible = true;
      this.isLoading = true;
      this.dataStorageService.fetchWorkspaces(+this.currentUser.id).subscribe( workspaces => {
        this.workspaces = workspaces;
          this.dataStorageService.fetchOtherUsers(+this.currentUser.id).subscribe( users =>{
              Object.values(users).forEach( user => {
                this.originOptions.push({
                  value: user.username,
                  label: user.username
                });
              });
              this.isLoading = false;
            },
            errorMessage => {
              this.message.create('error',errorMessage);
              this.isVisible = false;
            });
      },
        errorMessage => {
          this.message.create('error',errorMessage);
          this.isVisible = false;
        });
    });
    this.workspaceService.workspacesChanged.subscribe( workspaces => {
      this.zone.run( () => {
        this.workspaces = workspaces;
      });
    });
  }

  close() {
    this.isVisible = false;
    this.nzOptions = [];
    this.originOptions = [];
  }

  onRemove(workspace: Workspace) {
    this.removeId = workspace.id;
    this.isRemoveLoading = true;
    this.dataStorageService.deleteWorkspace(workspace,+this.currentUser.id).subscribe(value => {
      if (this.currentWorkspaceId == workspace.id){
        this.router.navigate(['lists']);
      }
      this.workspaceService.removeWorkspace(workspace.id);
      this.isRemoveLoading = false;
      },
      errorMessage => {
        this.message.create('error',errorMessage);
        this.isRemoveLoading = false;
      })
  }

  startEdit(workspace: Workspace): void {
    this.editId = workspace.id;
    let originWorkspace = new Workspace(workspace.name,workspace.owner,workspace.sharedUsers);
    originWorkspace.id = workspace.id;
    originWorkspace.sharedSideLists = workspace.sharedSideLists;
    originWorkspace.sharedLists = workspace.sharedLists;
    this.originEditWorkspace = originWorkspace;
  }

  stopEdit(workspace: Workspace,index:number): void {
    workspace.name = ListComponent.trim(workspace.name);
    this.editWorkspace = workspace;
    this.editIndex = index;
    this.isMouseOut = true;
  }

  handleCancel() {
    this.editWorkspace.name = this.originEditWorkspace.name;
    this.isMouseOut = false;
    this.editId = null;
  }

  handleOk() {
    this.isOkLoading = true;
    this.dataStorageService.patchWorkspace(null,this.editWorkspace.id,+this.currentUser.id,null,this.editWorkspace.name,null).subscribe(() => {
        this.workspaceService.editWorkspaceName(this.editWorkspace.name,this.editWorkspace.id);
        this.isOkLoading = false;
        this.isMouseOut = false;
        this.editId = null;
      },
      errorMessage => {
        this.message.create('error',errorMessage);
        this.editWorkspace.name = this.originEditWorkspace.name;
        this.isOkLoading = false;
        this.isMouseOut = false;
        this.editId = null;
      })
  }

  onRemovePtpant(sharedUsers: [],workspaceId: number) {
    this.mgWorkspaceId = workspaceId;
    this.nzOptions = this.originOptions.filter( nzOption => {
      // @ts-ignore
      return sharedUsers.includes(nzOption.value);
    })
    this.isRemoveUsers = true;
    this.isUserMgVisible = true;
  }

  onAddPtpant(sharedUsers: [],workspaceId: number) {
    this.mgWorkspaceId = workspaceId;
    this.nzOptions = this.originOptions.filter( nzOption => {
      // @ts-ignore
      return !sharedUsers.includes(nzOption.value);
    })
    this.isRemoveUsers = false;
    this.isUserMgVisible = true;
  }

  userMdHandleCancel() {
    this.isUserMgVisible = false;
    this.nzOptions = [];
  }

  userMdHandleOk() {
    this.isOkLoading = true;
    const selectValues:[] = [];
    selectValues.push(...this.listOfSelectedValue);
    this.dataStorageService.patchWorkspace(
      null,
      this.mgWorkspaceId,
      +this.currentUser.id,
      this.isRemoveUsers?'removeUsers':'addUsers',
      null,
      selectValues).subscribe( value => {
        if (this.isRemoveUsers){
          this.workspaceService.removeSharedUsers(selectValues,this.mgWorkspaceId);
        }else {
          this.workspaceService.addSharedUsers(selectValues,this.mgWorkspaceId);
        }
      this.isUserMgVisible = false;
      this.nzOptions = [];
      this.isOkLoading = false;
      this.listOfSelectedValue = [];
    },
      errorMessage => {
        this.message.create('error',errorMessage);
        this.isUserMgVisible = false;
        this.nzOptions = [];
        this.isOkLoading = false;
        this.listOfSelectedValue = [];
      });
  }
}
