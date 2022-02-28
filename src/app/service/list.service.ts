import {List} from "../model/list.model";
import {Subject} from "rxjs";

export class ListService {
  listsChanged = new Subject<List[]>();

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

  removeLists(lists: List[]) {
    lists.forEach((value1) => {
      this._lists = this._lists.filter(value2 => {
        value1.id !== value2.id;
      });
    });
    this.listsChanged.next(this._lists.slice());
  }


  editList(list:List,index){
    this._lists[index] = list;
    this.listsChanged.next(this._lists.slice());
  }

}
