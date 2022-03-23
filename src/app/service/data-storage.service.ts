import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {List} from "../model/list.model";
import {catchError, map, tap} from "rxjs/operators";
import {throwError} from "rxjs";
import {Task} from "../model/task.model";
import {User} from "../model/user.model";
import {Workspace} from "../model/workspace.model";
import {SideList} from "../model/sideList.model";

export declare type WorkspaceOptType = 'addLists' | 'removeLists' | 'addUsers' | 'removeUsers';

@Injectable({providedIn: 'root'})
export class DataStorageService {

  constructor(private http: HttpClient) {
  }

  fetchOtherUsers (userId: number) {
    return this.http.get<User[]>(
      'http://127.0.0.1:8000/users/'+userId
    ).pipe(catchError(DataStorageService.handleError));
  }

  fetchLists (userId:number) {
    return this.http.get<List[]>(
      'http://127.0.0.1:8000/lists/'+userId
    ).pipe(catchError(DataStorageService.handleError));
  }

  fetchTasks (listId:number,workId:number,userId: number) {
    return this.http.get<Task[]>(
      'http://127.0.0.1:8000/tasks/'+listId+'?workId='+workId+'&userId='+userId
    ).pipe(catchError(DataStorageService.handleError));
  }

  fetchWorkspaces (userId: number) {
    return this.http.get<[{
      id:number;
      name:string;
      owner:string;
      sharedLists:[];
      sharedUsers:[];
    }]|null>(
      'http://127.0.0.1:8000/workSpaces/'+userId
    ).pipe(catchError(DataStorageService.handleError),
      map(workspaces => {
        let handleWorkspaces: Workspace[] = [];
        if (!!workspaces) {
          workspaces.forEach( (workspace,index) => {
            let handleSharedLists: List[] = [];
            let handleSharedSideLists: SideList[] = [];
            if (Object.values(workspace.sharedLists).length !== 0){
              workspace.sharedLists.forEach( (list:List,index) => {
                handleSharedLists[index] = new List(list.id,list.name,list.done);
                handleSharedSideLists[index] = new SideList(list.id,list.name);
              })
            }
            let handleWorkspace = new Workspace(workspace.name,workspace.owner,workspace.sharedUsers);
            handleWorkspace.id = workspace.id;
            handleWorkspace.sharedLists = handleSharedLists;
            handleWorkspace.sharedSideLists = handleSharedSideLists;
            handleWorkspaces[index] = handleWorkspace;
          })
        }
        return handleWorkspaces;
      }));
  }

  postLists (lists:List[],userId:number,workspaceId: number) {
    let listsName = [];
    lists.forEach((list,index)=> {
      listsName[index] = list.name;
    });
    return this.http.post<{
      'ids': [];
    }>('http://127.0.0.1:8000/lists/'+userId,
      {
        lists:listsName,
        workspaceId:workspaceId
      }).pipe(catchError(DataStorageService.handleError))
  }

  postTasks (task:Task,listId:number,userId: number,workId: number) {
    return this.http.post<{
      'id': number;
    }>('http://127.0.0.1:8000/tasks/'+listId,
      {
        name:task.name,
        content: task.content,
        startTime: task.startTime,
        endTime: task.endTime,
        userId: userId,
        workId: workId
      }).pipe(catchError(DataStorageService.handleError));
  }

  postWorkspace (workspace: Workspace,userId: number) {
    return this.http.post<{'id': number;}>
    ('http://127.0.0.1:8000/workSpaces/'+userId,
      {
        name:workspace.name,
        sharedUsers:workspace.sharedUsers
      }).pipe(catchError(DataStorageService.handleError));
  }

  patchWorkspace (ids:[],workspaceId: number,userId: number,type: WorkspaceOptType,name:string,names:[]) {
    return this.http.patch('http://127.0.0.1:8000/workSpaces/'+userId,
      {
        names: names,
        ids: ids,
        type: type,
        name: name,
        workId: workspaceId
      }).pipe(catchError(DataStorageService.handleError))
  }

  deleteLists (lists:List[],userId:number,workId: number) {
    let listIds = [];
    lists.forEach((list,index)=> {
      listIds[index] = list.id;
    })
    return this.http.delete('http://127.0.0.1:8000/lists/'+userId+'?workId='+workId,
      {
        body: listIds
      }).pipe(catchError(DataStorageService.handleError));
  }

  deleteTasks (tasks:Task[],userId: number,workId: number) {
    let taskIds = [];
    tasks.forEach((task,index)=> {
      taskIds[index] = task.id;
    })
    return this.http.delete('http://127.0.0.1:8000/tasks/'+userId+'?workId='+workId,
      {
        body: taskIds
      }).pipe(catchError(DataStorageService.handleError));
  }

  deleteWorkspace ( workspace:Workspace,userId: number) {
    return this.http.delete('http://127.0.0.1:8000/workSpaces/'+workspace.id+'/'+userId).
    pipe(catchError(DataStorageService.handleError));
  }

  patchList (list:any,
             userId:number,
             isModifiedName: boolean,
             isModifiedAllDone: boolean,
             value: boolean,
             workId: number) {
    return this.http.patch('http://127.0.0.1:8000/lists/'+userId,
      {
        filter:isModifiedName,
        modifiedAllDone:isModifiedAllDone,
        boolean:value,
        id:isModifiedAllDone? null:list.id,
        name:isModifiedName? list.name:null,
        done:isModifiedAllDone? null : isModifiedName? null:!list.done,
        workId: workId
      }).pipe(catchError(DataStorageService.handleError));
  }

  patchTask (task:any,
             listId:number,
             isModifiedContent: boolean,
             isModifiedAllDone: boolean,
             value: boolean,
             userId: number,
             workId: number) {
    return this.http.patch('http://127.0.0.1:8000/tasks',
      {
        filter:isModifiedContent,
        modifiedAllDone:isModifiedAllDone,
        boolean:value,
        taskId:isModifiedAllDone? null:task.id,
        listId:isModifiedAllDone? listId : null,
        name:isModifiedContent? task.name : null,
        content:isModifiedContent? task.content : null,
        startTime:isModifiedContent? task.startTime : null,
        endTime:isModifiedContent? task.endTime : null,
        done:isModifiedAllDone? null : isModifiedContent? null:!task.done,
        userId: userId,
        workId: workId
      }).pipe(catchError(DataStorageService.handleError));
  }

  private static handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error) {
      case 'USER_NOT_FOUND':
        errorMessage = 'No permission, no access.';
        break;
      case 'INVALID_TOKEN':
        errorMessage = 'No permission, no access.';
        break;
      case 'POST_FAILED':
        errorMessage = 'Empty parameters were passed.';
        break;
      case 'LIST_NOT_FOUND':
        errorMessage = 'This list does not exist.';
        break;
      case 'TASK_NOT_FOUND':
        errorMessage = 'This task does not exist.';
        break;
      case 'LISTS_NOT_FOUND':
        errorMessage = 'Some lists does not exist.';
        break;
      case 'LENGTH_TOO_LARGE':
        errorMessage = 'The length of your list name is too large.';
        break;
      case 'INVALID_CHARACTER':
        errorMessage = 'The character is invalid.';
        break;
      case 'ALL_TASKS_NOT_FOUND':
        errorMessage = 'There are no tasks to update.';
        break;
      case 'ALL_LISTS_NOT_FOUND':
        errorMessage = 'There are no lists to update.';
        break;
      case 'WORKSPACE_NOT_FOUND':
        errorMessage = 'This workspace does not exist.';
        break;
    }
    return throwError(errorMessage);
  }

}
