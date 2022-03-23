import {Injectable} from "@angular/core";
import {Workspace} from "../model/workspace.model";
import {Subject} from "rxjs";
import {List} from "../model/list.model";
import {Task} from "../model/task.model";
import {SideList} from "../model/sideList.model";

@Injectable({providedIn: 'root'})
export class WorkspaceService {
  constructor() {
    const url = new URL('http://127.0.0.1:3000/.well-known/mercure');
    url.searchParams.append('topic', 'https://todolist.com/workspaces');
    this.eventSource = new EventSource(url);
    this.eventSource.onmessage = ev => this.synchronisationEvent.next(JSON.parse(ev.data));
  }

  ngOnDestroy(): void {
    this.eventSource.close();
  }

  workspacesChanged = new Subject<Workspace[]>();
  workspaceDeleted = new Subject<number>();
  synchronisationEvent = new Subject<any>();

  private eventSource:EventSource;
  private _workspaces: Workspace[] = [];

  setWorkspaces(workspaces: Workspace[]) {
    this._workspaces = workspaces;
    this.workspacesChanged.next(this._workspaces.slice());
  }

  get workspaces(): Workspace[] {
    return this._workspaces.slice();
  }

  addWorkspace(workspace: Workspace): void {
    this._workspaces.push(workspace);
    this.workspacesChanged.next(this._workspaces.slice());
  }

  editWorkspaceName(name: string,id: number) {
    let workIndex = this._workspaces.findIndex( workspace => {
      return workspace.id == id;
    });
    if (workIndex > -1) {
      this._workspaces[workIndex].name = name;
      this.workspacesChanged.next(this._workspaces.slice());
    }
  }

  editSharedList(sharedList: List,workspaceId: number) {
    let workIndex = this._workspaces.findIndex( workspace => {
      return workspace.id == workspaceId;
    });
    if (workIndex > -1){
      let index = this._workspaces[workIndex].sharedLists.findIndex( list => {
        return list.id == sharedList.id;
      });
      if (index > -1){
        this._workspaces[workIndex].sharedLists[index] = sharedList;
        this._workspaces[workIndex].sharedSideLists[index] = new SideList(sharedList.id,sharedList.name);
        this.workspacesChanged.next(this._workspaces.slice());
      }
    }
  }

  setSharedTasks(tasks: Task[],workspaceId: number,listId: number){
    let workIndex = this._workspaces.findIndex( workspace => {
      return workspace.id == workspaceId;
    });
    if (workIndex > -1){
      let sharedSideListIndex = this._workspaces[workIndex].sharedSideLists.findIndex( sideList => {
        return sideList.id == listId;
      })
      if (sharedSideListIndex > -1){
        this._workspaces[workIndex].sharedSideLists[sharedSideListIndex].tasks = tasks;
        this.workspacesChanged.next(this._workspaces.slice());
      }
    }
  }

  addSharedSideLists(sideLists: SideList[],workspaceId: number) {
    let workIndex = this._workspaces.findIndex( workspace => {
      return workspace.id == workspaceId;
    })
    if (workIndex > -1){
      this._workspaces[workIndex].sharedSideLists.push(...sideLists);
      this.workspacesChanged.next(this._workspaces.slice());
    }
  }

  addSharedLists(lists: List[],workspaceId: number) {
    let workIndex = this._workspaces.findIndex( workspace => {
      return workspace.id == workspaceId;
    })
    if (workIndex > -1){
      this._workspaces[workIndex].sharedLists.push(...lists);
      console.log(this._workspaces[workIndex].sharedLists);
      this.workspacesChanged.next(this._workspaces.slice());
    }
  }

  removeSharedList(listId: number,workspaceId: number) {
    let workIndex = this._workspaces.findIndex( workspace => {
      return workspace.id == workspaceId;
    })
    if (workIndex > -1){
      let sharedSideListIndex = this._workspaces[workIndex].sharedSideLists.findIndex( sideList => {
        return sideList.id == listId;
      })
      if (sharedSideListIndex > -1) {
        this._workspaces[workIndex].sharedSideLists.splice(sharedSideListIndex,1);
        this._workspaces[workIndex].sharedLists.splice(sharedSideListIndex,1);
        this.workspacesChanged.next(this._workspaces.slice());
      }
    }
  }

  removeSharedLists(removeLists: List[],workspaceId: number) {
    removeLists.forEach( list => {
      this.removeSharedList(list.id,workspaceId);
    })
  }

  removeSharedUsers(removeUsers:[],workspaceId: number) {
    let workIndex = this._workspaces.findIndex( workspace => {
      return workspace.id == workspaceId;
    });
    if (workIndex > -1){
      removeUsers.forEach( user => {
        let sharedUserIndex = this._workspaces[workIndex].sharedUsers.findIndex( username => {
          return username == user;
        });
        if (sharedUserIndex > -1){
          this._workspaces[workIndex].sharedUsers.splice(sharedUserIndex,1);
          this.workspacesChanged.next(this._workspaces.slice());
        }
      });
    }
  }

  removeWorkspace(id: number) {
    let workIndex = this._workspaces.findIndex( workspace => {
      return workspace.id == id;
    });
    if (workIndex > -1) {
      this._workspaces.splice(workIndex, 1);
      this.workspacesChanged.next(this._workspaces.slice());
    }
  }

  addSharedUsers(addUsers: [], workspaceId: number) {
    let workIndex = this._workspaces.findIndex( workspace => {
      return workspace.id == workspaceId;
    })
    if (workIndex > -1){
      this._workspaces[workIndex].sharedUsers.push(...addUsers);
      this.workspacesChanged.next(this._workspaces.slice());
    }
  }
}
