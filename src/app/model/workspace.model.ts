import {List} from "./list.model";
import {SideList} from "./sideList.model";

export class Workspace {
  private _id: number;
  private _name: string;
  private _owner: string;
  private _sharedLists: List[];
  private _sharedUsers: [];
  private _sharedSideLists: SideList[];


  constructor(name: string, owner: string, sharedUsers: []) {
    this._name = name;
    this._owner = owner;
    this._sharedUsers = sharedUsers;
  }

  get sharedSideLists(): SideList[] {
    return this._sharedSideLists;
  }

  set sharedSideLists(value: SideList[]) {
    this._sharedSideLists = value;
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

  get owner(): string {
    return this._owner;
  }

  set owner(value: string) {
    this._owner = value;
  }

  get sharedUsers(): [] {
    return this._sharedUsers;
  }

  set sharedUsers(value: []) {
    this._sharedUsers = value;
  }


  get sharedLists(): List[] {
    return this._sharedLists;
  }

  set sharedLists(value: List[]) {
    this._sharedLists = value;
  }
}
