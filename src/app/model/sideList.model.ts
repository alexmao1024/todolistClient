import {Task} from "./task.model";

export class SideList {
  private _id: number;
  private _name: string;
  private _tasks: Task[];
  private _workspaceId: number;


  constructor(id: number, name: string) {
    this._id = id;
    this._name = name;
  }


  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get tasks(): Task[] {
    return this._tasks;
  }

  set tasks(value: Task[]) {
    this._tasks = value;
  }

  get workspaceId(): number {
    return this._workspaceId;
  }

  set workspaceId(value: number) {
    this._workspaceId = value;
  }
}
