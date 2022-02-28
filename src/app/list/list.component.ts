import {Component, OnDestroy, OnInit} from '@angular/core';
import {List} from "../model/list.model";
import {ListService} from "../service/list.service";
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy{
  private listsChangeSub: Subscription;

  lists: List[];
  addIsVisible: boolean = false;
  editIsVisible: boolean = false;

  listItem :List;
  listIndex:number;

  editId: string | null = null;

  constructor(private listService: ListService,public msg: NzMessageService) {

  }

  startEdit(id: string): void {
    this.editId = id;
  }

  stopEdit(): void {
    this.editId = null;
  }

  ngOnDestroy(): void {
    this.listsChangeSub.unsubscribe();
    }

  ngOnInit(): void {
    this.lists = this.listService.lists;
    this.listsChangeSub = this.listService.listsChanged.subscribe(
      (lists:List[]) => {
        this.lists = lists;
      }
    );
  }

  onBack() {

  }

  onShowAddModal(): void {
    this.addIsVisible = true;
  }

  onCloseAddModel() {
    this.addIsVisible = false;
  }

  onRemoveList(index:number) {
    this.listService.removeList(index);
  }

  onShowEditModal(list:List,index:number) {
    this.editIsVisible = true;
    this.listIndex = index;
    this.listItem = new List(list.id,list.name,list.done);
  }

  onCloseEditModel() {
    this.editIsVisible = false;
  }

  onItemChecked(index: number): void {
    this.listService.selectDone(index);
  }

  onAllChecked(value: boolean): void {
    this.listService.toggleAll = value;
  }

  onClearDone() {
    this.listService.removeLists(this.listService.selectLists);
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


}
