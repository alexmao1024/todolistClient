import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {List} from "../model/list.model";
import {ListService} from "../service/list.service";
import {AuthService} from "../service/auth.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit,OnDestroy{
  private listsChangeSub: Subscription;
  private userSub: Subscription;

  isAuthenticated:boolean = false;
  lists: List[];

  constructor(private listService: ListService,private authService: AuthService) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user=>{
      this.isAuthenticated = !!user;
    })
    this.lists = this.listService.lists;
    this.listsChangeSub = this.listService.listsChanged.subscribe(
      (lists:List[]) => {
        this.lists = lists;
      }
    );
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.listsChangeSub.unsubscribe();
  }

}
