import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {List} from "../model/list.model";
import {ListService} from "../service/list.service";
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subscription} from "rxjs";
import {DataStorageService} from "../service/data-storage.service";
import {User} from "../model/user.model";
import {AuthService} from "../service/auth.service";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy{

  private listsChangeSub: Subscription;
  private userSub: Subscription;
  currentUser: User;

  lists: List[];
  addIsVisible: boolean = false;
  editIsVisible: boolean = false;

  listItem :List;
  listIndex:number;

  removeId: number;
  editId: number;
  originEditList: List;
  editList: List;
  editIndex: number;

  isLoading:boolean = false;
  isRemoveLoading:boolean = false;
  isClearDoneLoading:boolean = false;
  isMouseOut:boolean = false;
  isOkLoading: boolean = false;

  constructor(private listService: ListService,
              public msg: NzMessageService,
              private dataStorageService:DataStorageService,
              private authService:AuthService,
              private message: NzMessageService) {
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
    }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user=>{
      this.currentUser = user;
    })
    if (this.currentUser){
      this.isLoading = true;
      this.dataStorageService.fetchLists(+this.currentUser.id).subscribe( value => {
        this.isLoading = false;
      },
        errorMessage => {
          this.message.create('error',errorMessage);
          this.isLoading = false;
        });
      this.listsChangeSub = this.listService.listsChanged.subscribe(
        (lists:List[]) => {
          this.lists = lists;
        }
      );

    }
  }

  onBack() {

  }

  onShowAddModal(): void {
    this.addIsVisible = true;
  }

  onCloseAddModel() {
    this.addIsVisible = false;
  }

  onRemoveList(list:List,index:number) {
    this.removeId = list.id;
    this.isRemoveLoading = true;
    this.dataStorageService.deleteLists([list],+this.currentUser.id).subscribe(value => {
      this.listService.removeList(index);
      this.isRemoveLoading = false;
      },
      errorMessage => {
        this.message.create('error',errorMessage);
        this.isRemoveLoading = false;
      }
    )
  }

  onShowEditModal(list:List,index:number) {
    this.editIsVisible = true;
    this.listIndex = index;
    this.listItem = new List(list.id,list.name,list.done);
  }

  onCloseEditModel() {
    this.editIsVisible = false;
  }

  onItemChecked(list:List,index: number): void {
    this.dataStorageService.patchList(list,+this.currentUser.id,false,false,null).subscribe(value => {
      },
      errorMessage => {
        this.message.create('error',errorMessage);
      });
    this.listService.selectDone(index);
  }

  onAllChecked(value: boolean): void {
    this.dataStorageService.patchList(null,+this.currentUser.id,false,true,value).subscribe(value1 => {
    },
      errorMessage => {
        this.message.create('error',errorMessage);
      });
    this.listService.toggleAll = value;
  }

  onClearDone() {
    this.isClearDoneLoading = true;
    this.dataStorageService.deleteLists(this.listService.selectLists,+this.currentUser.id).
    subscribe(value => {
      this.listService.removeLists();
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
    return this.listService.selectLists.length;
  }

  handleCancel() {
    this.editList.name = this.originEditList.name;
    this.isMouseOut = false;
    this.editId = null;
  }

  handleOk() {
    this.isOkLoading = true;
    this.dataStorageService.patchList(this.editList,+this.currentUser.id,true,false,null).subscribe(value => {
      this.listService.editList(this.editList,this.editIndex);
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

  private static trim(str:string){
    const reg = /^\s+|\s+$/g;
    return str.replace(reg,'');
  }
}
