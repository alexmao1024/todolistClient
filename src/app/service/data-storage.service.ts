import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ListService} from "./list.service";
import {List} from "../model/list.model";
import {catchError, map, tap} from "rxjs/operators";
import {throwError} from "rxjs";

@Injectable({providedIn: 'root'})
export class DataStorageService {
  constructor(private http: HttpClient,private listService:ListService) {
  }

  fetchLists (userId:number) {
    return this.http.get<List[]>(
      'https://127.0.0.1:8000/lists/'+userId
    ).pipe(catchError(DataStorageService.handleError),tap(lists => {
      this.listService.setList(lists);
    }))
  }

  postLists (lists:List[],userId:number) {
    let listsName = [];
    lists.forEach((list,index)=> {
      listsName[index] = list.name;
    });
    return this.http.post<{
      'ids': [];
    }>('https://127.0.0.1:8000/lists/'+userId,
      {
        lists:listsName
      }).pipe(catchError(DataStorageService.handleError),
        map(resData => {
          resData.ids.forEach((id,index)=> {
          lists[index].id = id
        })
          return lists;
    }),
      tap(lists => {
        this.listService.addList(lists);
      }))
  }

  deleteLists (lists:List[],userId:number) {
    let listIds = [];
    lists.forEach((list,index)=> {
      listIds[index] = list.id;
    })
    return this.http.delete('https://127.0.0.1:8000/lists/'+userId,
      {
        body: listIds
      }).pipe(catchError(DataStorageService.handleError));
  }

  patchList (list:any,
             userId:number,
             isModifiedName: boolean,
             isModifiedAllDone: boolean,
             value: boolean) {
    return this.http.patch('https://127.0.0.1:8000/lists/'+userId,
      {
        filter:isModifiedName,
        modifiedAllDone:isModifiedAllDone,
        boolean:value,
        id:isModifiedAllDone? null:list.id,
        name:isModifiedName? list.name:null,
        done:isModifiedAllDone? null : isModifiedName? null:!list.done
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
      case 'LISTS_NOT_FOUND':
        errorMessage = 'Some lists does not exist.';
        break;
      case 'LENGTH_TOO_LARGE':
        errorMessage = 'The length of your list name is too large.';
        break;
      case 'INVALID_CHARACTER':
        errorMessage = 'The character is invalid';
        break;
    }
    return throwError(errorMessage);
  }
}
