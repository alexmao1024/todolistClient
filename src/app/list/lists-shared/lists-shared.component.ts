import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {TransferItem} from "ng-zorro-antd/transfer";
import {SideList} from "../../model/sideList.model";
import {SidebarService} from "../../service/sidebar.service";
import {Subscription} from "rxjs";
import {DataStorageService} from "../../service/data-storage.service";
import {AuthService} from "../../service/auth.service";
import {WorkspaceService} from "../../service/workspace.service";
import {ListService} from "../../service/list.service";
import {List} from "../../model/list.model";
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'app-lists-shared',
  templateUrl: './lists-shared.component.html',
  styleUrls: ['./lists-shared.component.css']
})
export class ListsSharedComponent implements OnInit , OnDestroy{
  private userSub: Subscription;

  isVisible: boolean = false;
  @Input() workspaceId: number = 0;
  @Input() workspaceOwner: string;
  userId : number;

  @Input() isOpen: EventEmitter<void>;
  @Output() invisible = new EventEmitter<void>();
  @Output() inLoading = new EventEmitter<void>();
  isOkLoading: boolean = false;
  disabled = false;

  lists: TransferItem[] = [];
  sideLists: SideList[] = [];
  sharedLists: List[] = [];

  constructor(private sidebarService: SidebarService,
              private dataStorageService: DataStorageService,
              private workspaceService: WorkspaceService,
              private listService: ListService,
              private authService: AuthService,
              private message: NzMessageService) { }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user=> {
      this.userId = +user?.id;
      this.isOpen.subscribe( value => {
        this.dataStorageService.fetchLists(+user?.id).subscribe(lists => {
          this.sharedLists = lists;
          let sideLists: SideList[] = [];
          lists.forEach((list, index) => {
            let sideList = new SideList(list.id, list.name);
            sideList.workspaceId = list.workspaceId;
            sideLists[index] = sideList;
          });
          this.sideLists = sideLists;
          this.sideLists.forEach( sideList =>{
            this.lists.push({
              key: sideList.id,
              title: sideList.name,
              direction: !!(sideList.workspaceId)?"right":"left",
              description: sideList.workspaceId,
              disabled: (sideList.workspaceId != this.workspaceId) && !!(sideList.workspaceId)
            });
          });
          this.isVisible = true;
          this.inLoading.emit();
        },
          errorMessage => {
            this.message.create('error',errorMessage);
            this.isVisible = false;
            this.inLoading.emit();
          });
      });
    });
  }

  filterOption(inputValue: string, item: any): boolean {
    let valueArray = [...item.title];
    return valueArray.indexOf(inputValue) > -1;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.invisible.emit();
    this.lists.splice(0,this.lists.length);
  }

  submitForm() {
    this.isOkLoading = true;
    this.handleListsIds('right');
    this.handleListsIds('left');
  }

  private handleListsIds(direction: string)
  {
    const sharedTransLists = this.lists.filter( list => {
      return list.direction === direction && !list.disabled;
    })
    const listsIds:[] = [];
    sharedTransLists?.forEach( list => {
      // @ts-ignore
      listsIds.push(list.key);
    });
    let newLists:List[] = [];
    let sideLists:SideList[] = [];
    listsIds.forEach( id => {
      let findIndex = this.sharedLists.findIndex(list => list.id == id);
      if (findIndex > -1){
        newLists.push(this.sharedLists[findIndex]);
        sideLists.push(this.sideLists[findIndex]);
      }
    });
    if (this.workspaceId != 0){
      this.dataStorageService.patchWorkspace(listsIds,this.workspaceId,this.userId,(direction == 'right' ? 'addLists' : 'removeLists'),null,null).subscribe(value => {
        if (direction == 'right'){
          this.workspaceService.addSharedLists(newLists,this.workspaceId);
          this.workspaceService.addSharedSideLists(sideLists,this.workspaceId);
        }else {
          this.workspaceService.removeSharedLists(listsIds,this.workspaceId);
        }
        this.isOkLoading = false;
        this.isVisible = false;
        this.invisible.emit();
        this.lists.splice(0,this.lists.length);
      },
        errorMessage => {
        if (direction == 'right'){
          this.message.create('error',errorMessage);
        }
          this.isOkLoading = false;
          this.isVisible = false;
          this.invisible.emit();
          this.lists.splice(0,this.lists.length);
        });
    }
  }
}
