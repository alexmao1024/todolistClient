import {Component, EventEmitter, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {List} from "../model/list.model";
import {ListService} from "../service/list.service";
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subscription} from "rxjs";
import {DataStorageService} from "../service/data-storage.service";
import {User} from "../model/user.model";
import {AuthService} from "../service/auth.service";
import {SidebarService} from "../service/sidebar.service";
import {SideList} from "../model/sideList.model";
import {WorkspaceService} from "../service/workspace.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy{
  @Input() workspaceId: number = 0;
  @Input() workspaceOwner: string;

  private workspaceListsChangedSub: Subscription;
  private workspaceDeletedSub: Subscription;
  private listsChangeSub: Subscription;
  private userSub: Subscription;
  currentUser: User;

  lists: List[] = [];
  addIsVisible: boolean = false;
  editIsVisible: boolean = false;
  sharedIsVisible: boolean = false;
  sharedIsOpen = new EventEmitter<void>();
  workspaceIsVisible: boolean = false;

  listItem :List;
  listIndex:number;

  removeId: number;
  editId: number;
  originEditList: List;
  editList: List;
  editIndex: number;

  @Input() isFetch: EventEmitter<boolean>;
  isLoading:boolean = false;
  isSharedLoading:boolean = false;
  isRemoveLoading:boolean = false;
  isClearDoneLoading:boolean = false;
  isMouseOut:boolean = false;
  isOkLoading: boolean = false;

  constructor(private listService: ListService,
              private sidebarService: SidebarService,
              private workspaceService: WorkspaceService,
              private msg: NzMessageService,
              private dataStorageService:DataStorageService,
              private authService:AuthService,
              private message: NzMessageService,
              private router: Router,
              private zone:NgZone) {
  }

  startEdit(list: List): void {
    this.editId = list.id;
    this.originEditList = new List(list.id,list.name,list.done);
  }

  stopEdit(list:List,index:number): void {
    list.name = ListComponent.trim(list.name);
    this.editList = list;
    this.editIndex = index;
    this.isMouseOut = true;
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.listsChangeSub.unsubscribe();
    this.workspaceDeletedSub?.unsubscribe();
    this.workspaceListsChangedSub?.unsubscribe();
  }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user=>{
      this.currentUser = user;
    });
    if (!!this.currentUser){
      if (this.workspaceId == 0){
        this.isLoading = true;
        this.dataStorageService.fetchLists(+this.currentUser.id).subscribe( lists => {
          this.listService.setLists(lists);
          this.isLoading = false;
        },
          errorMessage => {
            this.message.create('error',errorMessage);
            this.isLoading = false;
          });
        this.listsChangeSub = this.listService.listsChanged.subscribe(
          (lists:List[]) => {
            this.zone.run(()=>{
              this.lists = lists;
              let sideLists: SideList[] = [];
              lists.forEach((list,index) => {
                sideLists[index] = new SideList(list.id,list.name);
              })
              this.sidebarService.setSideLists(sideLists);
            });
          }
        )
      }else {
        this.isLoading = true;
        this.workspaceDeletedSub = this.workspaceService.workspaceDeleted.subscribe( id => {
          this.zone.run( () => {
            if (this.workspaceId == id){
              this.router.navigate(['lists']);
            }
          });
        });
        this.isFetch.subscribe( value => {
          this.isLoading = value;
        });
        this.listsChangeSub = this.listService.listsChanged.subscribe(
          (lists:List[]) => {
            this.zone.run(()=>{
              this.lists = lists;
            });
          }
        )
      }
    }
  }

  onShowAddModal(): void {
    this.addIsVisible = true;
  }

  onCloseAddModel() {
    this.addIsVisible = false;
  }

  onShowEditModal(list:List,index:number) {
    this.editIsVisible = true;
    this.listIndex = index;
    this.listItem = new List(list.id,list.name,list.done);
  }

  onCloseEditModel() {
    this.editIsVisible = false;
  }

  onShowWorkspaceModal() {
    this.workspaceIsVisible = true;
  }

  onCloseWorkspaceModel() {
    this.workspaceIsVisible = false;
  }

  onRemoveList(list:List) {
    this.removeId = list.id;
    this.isRemoveLoading = true;
    this.dataStorageService.deleteLists([list],+this.currentUser.id,this.workspaceId).subscribe(value => {
      if (this.workspaceId == 0){
        this.listService.removeListById(list.id);
      }else {
        this.sidebarService.removeSideList(list.id);
        this.workspaceService.removeSharedList(list.id,this.workspaceId);
      }
      this.isRemoveLoading = false;
      },
      errorMessage => {
        this.message.create('error',errorMessage);
        this.isRemoveLoading = false;
      }
    )
  }


  onItemChecked(list:List): void {
    this.dataStorageService.patchList(list,+this.currentUser.id,false,false,null,this.workspaceId).subscribe(value => {
      },
      errorMessage => {
        this.message.create('error',errorMessage);
      });
    this.listService.selectDone(list.id,!list.done);
  }

  onAllChecked(value: boolean): void {
    this.dataStorageService.patchList(null,+this.currentUser.id,false,true,value,this.workspaceId).subscribe(value1 => {
    },
      errorMessage => {
        this.message.create('error',errorMessage);
      });
    this.listService.toggleAll = value;
  }

  onClearDone() {
    this.isClearDoneLoading = true;
    this.dataStorageService.deleteLists(this.listService.selectLists,+this.currentUser.id,this.workspaceId).
    subscribe(value => {
      if (this.workspaceId == 0){
        this.listService.selectLists.forEach( list => {
          this.listService.removeListById(list.id);
        });
      }else {
        this.listService.selectLists.forEach( list => {
          this.workspaceService.removeSharedList(list.id,this.workspaceId);
        });
      }
      this.isClearDoneLoading = false;
    },
      errorMessage => {
        this.message.create('error',errorMessage);
        this.isClearDoneLoading = false;
      });
  }

  get toggleAll () {
    return this.listService.toggleAll;
  }

  get toggleSome () {
    return this.listService.toggleSome;
  }

  get selectListCount () {
    return this.listService.selectLists?.length;
  }

  handleCancel() {
    this.editList.name = this.originEditList.name;
    this.isMouseOut = false;
    this.editId = null;
  }

  handleOk() {
    this.isOkLoading = true;
    this.dataStorageService.patchList(this.editList,+this.currentUser.id,true,false,null,this.workspaceId).subscribe(value => {
      if (this.workspaceId == 0){
        this.listService.editListById(this.editList.id,this.editList.name,this.editList.done);
      }else {
        this.sidebarService.editSideList(new SideList(this.editList.id,this.editList.name));
        this.workspaceService.editSharedList(this.editList,this.workspaceId);
      }
      this.isOkLoading = false;
      this.isMouseOut = false;
      this.editId = null;
    },
      errorMessage => {
        this.message.create('error',errorMessage);
        this.editList.name = this.originEditList.name;
        this.isOkLoading = false;
        this.isMouseOut = false;
        this.editId = null;
      })
  }

  onShowSharedTask(id: number) {
    if (this.workspaceId != 0){
      this.router.navigate(['lists/'+id+'/tasks/'+this.workspaceId]);
    } else{
      this.router.navigate(['lists/'+id+'/tasks/0'])
    }
  }

  onShowSharedListModal() {
    this.sharedIsVisible = true;
    this.isSharedLoading = true;
    this.sharedIsOpen.emit();
  }

  onCloseShareModal() {
    this.sharedIsVisible = false;
  }

  onSharedLoadingEvent() {
    this.isSharedLoading = false;
  }

  static trim(str:string){
    const reg = /^\s+|\s+$/g;
    return str.replace(reg,'');
  }

}
