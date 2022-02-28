import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {List} from "../model/list.model";
import {ListService} from "../service/list.service";

@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrls: ['./sider.component.css']
})
export class SiderComponent implements OnInit,OnDestroy{
  private listsChangeSub: Subscription;

  lists: List[];

  constructor(private listService: ListService) { }

  ngOnInit(): void {
    this.lists = this.listService.lists;
    this.listsChangeSub = this.listService.listsChanged.subscribe(
      (lists:List[]) => {
        this.lists = lists;
      }
    );
  }

  ngOnDestroy(): void {
    this.listsChangeSub.unsubscribe();
  }

}
