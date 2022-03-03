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
  @ViewChild('inputElement') editEleRef: ElementRef;

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
              private authService:AuthService) {
  }

  startEdit(id: number): void {
    this.editId = id;
  }

  stopEdit(list:List,index:number): void {
    this.originEditList = new List(list.id,list.name,list.done,list.userId);
    this.editList = new List(list.id,this.editEleRef.nativeElement.value,list.done,list.userId);
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

  onRemoveList(id:number,index:number) {
    this.removeId = id;
    this.isRemoveLoading = true;
    this.dataStorageService.deleteList(id,+this.currentUser.id).subscribe(value => {
      this.listService.removeList(index);
      this.isRemoveLoading = false;
      }
    )
  }

  onShowEditModal(list:List,index:number) {
    this.editIsVisible = true;
    this.listIndex = index;
    this.listItem = new List(list.id,list.name,list.done,+this.currentUser.id);
  }

  onCloseEditModel() {
    this.editIsVisible = false;
  }

  onItemChecked(list:List,index: number): void {
    this.dataStorageService.patchList(list,+this.currentUser.id,false).subscribe();
    this.listService.selectDone(index);
  }

  onAllChecked(value: boolean): void {
    this.dataStorageService.patchToggleAll(value,+this.currentUser.id).subscribe();
    this.listService.toggleAll = value;
  }

  onClearDone() {
    this.isClearDoneLoading = true;
    this.dataStorageService.deleteLists(this.listService.selectLists,+this.currentUser.id).
    subscribe(value => {
      this.listService.removeLists();
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
    this.editEleRef.nativeElement.value = this.originEditList.name;
    this.isMouseOut = false;
    this.editId = null;
  }

  handleOk() {
    this.isOkLoading = true;
    this.dataStorageService.patchList(this.editList,+this.currentUser.id,true).subscribe(value => {
      this.listService.editList(this.editList,this.editIndex);
      this.isOkLoading = false;
      this.isMouseOut = false;
      this.editId = null;
    })
  }
}
