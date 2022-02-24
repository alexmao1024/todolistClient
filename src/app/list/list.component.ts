import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {List} from "../model/list.model";
import {ListService} from "../service/list.service";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit{
  lists: List[];
  editList: List;
  toggleAll: boolean = true;

  @ViewChild('nameInput', {static: false}) nameInputRef: ElementRef;

  @HostListener('document:click', ['$event']) bodyClick(event) {
    if (event.target.id != 'save-button' && event.target.id != 'edit') {
      this.editList = null;
    }
  }

  constructor(private listService: ListService) {

  }

  ngOnInit(): void {
    this.lists = this.listService.lists;
    this.listService.listsChanged.subscribe(
      (lists:List[]) => {
        this.lists = lists;

      }
    );
  }

  onAddList(event):void {
    const nameText = event.target.value;
    if (!nameText.length) {
      return;
    }
    let lastList = this.lists[this.lists.length - 1];
    const newList = new List(
      lastList ? lastList.id + 1 : 1,
      nameText,
      false
    )
    this.listService.addList(newList);

    event.target.value = '';
  }

  onSelectDone(index: number) {
    this.listService.selectDone(index);
    this.toggleAll = this.listService.toggleAll;
  }

  onToggleAll(event:boolean) {
    this.listService.toggleAll = event;
  }

  onRemoveList(index: number) {
    this.listService.removeList(index);
  }

  onSaveEdit(list:List,index:number,event) {
    if (list.done)
    {
      if (event)
      {
        event.target.value = this.editList.name;
      }
      this.editList = null;
      return
    }
    console.log(this.nameInputRef.nativeElement.value);
    list.name = this.nameInputRef.nativeElement.value;
    this.listService.editList(list,index);
    this.editList = null;
  }

  handleEditKeyUp (event) {
    const {keyCode,target} = event;
    if (keyCode === 27){
      target.value = this.editList.name;
      this.editList = null;
    }
  }
}
