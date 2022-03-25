import {List} from "../model/list.model";
import {Subject} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class ListService{

  constructor() {
  }

  listsChanged = new Subject<List[]>();
  listsRemoved = new Subject<number[]>();

  private _lists: List[] = [];

  setLists(lists: List[]) {
    this._lists = lists;
    this.listsChanged.next(this._lists?.slice());
  }

  get lists(): List[] {
    return this._lists?.slice();
  }

  get toggleAll () {
    return this._lists.every( list => list.done );
  }

  get toggleSome () {
    return this._lists?.some(list => list.done);
  }

  get selectLists () {
    return this._lists?.filter(list => list.done);
  }

  set toggleAll (val:boolean) {
    this._lists.forEach(list => list.done = val);
    this.listsChanged.next(this._lists.slice());
  }

  addLists(newLists: List[]): void {
    this._lists.push(...newLists);
    this.listsChanged.next(this._lists.slice());
  }

  selectDone(id:number,value:boolean) {
    let index = this._lists.findIndex( list => {
      return list.id == id;
    });
    if (index > -1){
      this._lists[index].done = value;
      this.listsChanged.next(this._lists.slice());
    }
  }

  editListById(id:number,name:string,done:boolean){
    let index = this._lists.findIndex( list => {
      return list.id == id;
    })
    if (index > -1){
      if (!!name){
        this._lists[index].name = name;
      }else{
        this._lists[index].done = done;
      }
      this.listsChanged.next(this._lists.slice());
    }
  }

  removeListById(id: number) {
    let index = this._lists.findIndex( list => {
      return list.id == id;
    })
    if (index > -1){
      this._lists.splice(index,1);
      this.listsChanged.next(this._lists.slice());
    }
  }
}
