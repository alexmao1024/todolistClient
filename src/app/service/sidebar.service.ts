import {Subject} from "rxjs";
import {SideList} from "../model/sideList.model";
import {Task} from "../model/task.model";

export class SidebarService {

  constructor() {
  }

  sideListsChanged = new Subject<SideList[]>();
  showDetailModal = new Subject<[boolean,Task]>();
  closeDetailModal = new Subject<boolean>();

  private _sideLists: SideList[] = [];

  setSideLists(sideLists: SideList[]) {
    this._sideLists = sideLists;
    this.sideListsChanged.next(this._sideLists.slice());
  }

  get sideLists(): SideList[] {
    return this._sideLists.slice();
  }

  setSideListTasks(tasks: Task[],listId:number) {
    let index = this._sideLists.findIndex( sideList => {
      return sideList.id == listId;
    })
    if (index > -1){
      this._sideLists[index].tasks = tasks;
      this.sideListsChanged.next(this._sideLists.slice());
    }
  }

  addSideListTask(task: Task,id:number) {
    let sideListIndex = this._sideLists.findIndex( sideList => {
      return sideList.id == id;
    });
    if (sideListIndex > -1){
      this._sideLists[sideListIndex].tasks.push(task);
      this.sideListsChanged.next(this._sideLists.slice());
    }
  }

  addSideLists(newLists: SideList[]){
    this._sideLists.push(...newLists);
    this.sideListsChanged.next(this._sideLists.slice());
  }

  editSideList(editSideList: SideList){
    let index = this._sideLists.findIndex( sideList => {
      return sideList.id == editSideList.id;
    })
    if (index > -1)
    {
      this._sideLists[index] = editSideList;
      this.sideListsChanged.next(this._sideLists.slice());
    }
  }

  removeSideList(id: number){
    let index = this._sideLists.findIndex( sideList => {
      return sideList.id == id;
    })
    if (index > -1){
      this._sideLists.splice(index,1);
      this.sideListsChanged.next(this._sideLists.slice());
    }
  }

}
