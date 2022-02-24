import {List} from "../model/list.model";
import {EventEmitter} from "@angular/core";

export class ListService {
  listsChanged = new EventEmitter<List[]>();

  private _lists: List[] = [
    new List(1,'吃饭',true),
    new List(2,'睡觉',true)
  ];

  get lists(): List[] {
    return this._lists.slice();
  }

  get toggleAll () {
    return this._lists.every( list => list.done );
  }

  set toggleAll (val:boolean) {
    this._lists.forEach(list => list.done = val);
    this.listsChanged.emit(this._lists.slice());
  }

  addList(newList: List): void {
    this._lists.push(newList);
    this.listsChanged.emit(this._lists.slice());
  }

  selectDone(index: number) {
    this._lists[index].done = !this._lists[index].done;
    this.listsChanged.emit(this._lists.slice());
  }

  removeList(index: number) {
    this._lists.splice(index,1);
    this.listsChanged.emit(this._lists.slice());
  }

  editList(list:List,index){
    this._lists[index] = list;
    this.listsChanged.emit(this._lists.slice());
  }

}
