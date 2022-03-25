import {Subject} from "rxjs";
import {Task} from "../model/task.model";
import {Injectable, OnDestroy} from "@angular/core";

@Injectable({providedIn: 'root'})
export class TaskService{
  constructor() {
  }

  isAddTask = new Subject<[Task,number]>();
  isEditTask = new Subject<Task>();
  tasksChanged = new Subject<Task[]>();

  private _tasks: Task[] = [];

  setTasks(tasks: Task[]) {
    this._tasks = tasks;
    this.tasksChanged.next(this._tasks.slice());
  }

  get tasks(): Task[] {
    return this._tasks.slice();
  }


  get toggleAll () {
    return this._tasks.every( task => task.done );
  }

  get toggleSome () {
    return this._tasks.some(task => task.done);
  }

  get selectTasks () {
    return this._tasks.filter(task => task.done);
  }

  set toggleAll (val:boolean) {
    this._tasks.forEach(task => task.done = val);
    this.tasksChanged.next(this._tasks.slice());
  }

  addTask(task: Task): void {
    this._tasks.push(task);
    this.tasksChanged.next(this._tasks.slice());
  }

  selectDone(id:number, done: boolean) {
    let index = this._tasks.findIndex( task => {
      return task.id == id;
    });
    if (index > -1){
      this._tasks[index].done = done;
      this.tasksChanged.next(this._tasks.slice());
    }
  }

  removeTaskById(id: number) {
    let index = this._tasks.findIndex( task => {
      return task.id == id;
    });
    if (index > -1){
      this._tasks.splice(index,1);
      this.tasksChanged.next(this.tasks.slice());
    }
  }

  editTask(task:Task,index){
    this._tasks[index] = task;
    this.tasksChanged.next(this._tasks.slice());
  }

  editTaskById(task:Task) {
    let index = this._tasks.findIndex( findTask => {
      return findTask.id == task.id;
    });
    if (index > -1){
      this._tasks[index] = task;
      this.tasksChanged.next(this._tasks.slice());
    }
  }
}
