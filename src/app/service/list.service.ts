import {List} from "../model/list.model";
import {Subject} from "rxjs";

export class ListService {
  constructor() {
  }

  listsChanged = new Subject<List[]>();

  private _lists: List[] = [];

  setList(lists: List[]) {
    this._lists = lists;
    this.listsChanged.next(this._lists.slice());
  }

  get lists(): List[] {
    return this._lists.slice();
  }


  get toggleAll () {
    return this._lists.every( list => list.done );
  }

  get toggleSome () {
    return this._lists.some(list => list.done);
  }

  get selectLists () {
    return this._lists.filter(list => list.done);
  }

  set toggleAll (val:boolean) {
    this._lists.forEach(list => list.done = val);
    this.listsChanged.next(this._lists.slice());
  }

  addList(newLists: List[]): void {
    this._lists.push(...newLists);
    this.listsChanged.next(this._lists.slice());
  }

  selectDone(index: number) {
    this._lists[index].done = !this._lists[index].done;
    this.listsChanged.next(this._lists.slice());
  }

  removeList(index: number) {
    this._lists.splice(index,1);
    this.listsChanged.next(this._lists.slice());
  }

  removeLists() {
    this._lists = this._lists.filter(list => !list.done);
    this.listsChanged.next(this._lists.slice());
  }


  editList(list:List,index){
    this._lists[index] = list;
    this.listsChanged.next(this._lists.slice());
  }

}
