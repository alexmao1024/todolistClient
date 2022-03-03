import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ListService} from "./list.service";
import {List} from "../model/list.model";
import {map, tap} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class DataStorageService {
  constructor(private http: HttpClient,private listService:ListService) {
  }

  fetchLists (userId:number) {
    return this.http.get<List[]>(
      'https://127.0.0.1:8000/lists/'+userId
    ).pipe(map(lists => {
      return lists.map(list => {
        list.userId = userId;
        return list
      })
    }),tap(lists => {
      this.listService.setList(lists);
    }))
  }

  postLists (lists:List[],userId:number) {
    return this.http.post<{
      'ids': [];
    }>('https://127.0.0.1:8000/lists/'+userId,
      {
        lists:lists
      }).pipe(
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

  deleteList (id:number,userId:number) {
    return this.http.delete('https://127.0.0.1:8000/lists/'+id+'/'+userId);
  }

  deleteLists (lists:List[],userId:number) {
    let listIds = [];
    lists.forEach((list,index)=> {
      listIds[index] = list.id;
    })
    return this.http.delete('https://127.0.0.1:8000/lists/'+userId,
      {
        body: listIds
      });
  }

  patchList (list,userId:number,isModifiedName: boolean) {
    return this.http.patch('https://127.0.0.1:8000/lists/'+list.id+'/'+userId,
      {
        name:list.name,
        done:isModifiedName? list.done:!list.done
      });
  }

  patchToggleAll ( value: boolean,userId) {
    return this.http.patch('https://127.0.0.1:8000/lists/'+userId,{
      boolean:value
    });
  }
}
