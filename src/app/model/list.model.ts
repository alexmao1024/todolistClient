export class List {
  private _id: number;
  private _userId: number;
  private _name: string;
  private _done: boolean;


  constructor(id: number, name: string, done: boolean, userId:number) {
    this._id = id;
    this._name = name;
    this._done = done;
    this._userId = userId;
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

  get done(): boolean {
    return this._done;
  }

  set done(value: boolean) {
    this._done = value;
  }

  get userId(): number {
    return this._userId;
  }

  set userId(value: number) {
    this._userId = value;
  }
}

