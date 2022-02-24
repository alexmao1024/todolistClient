export class List {
  private _id: number;
  private _name: string;
  private _done: boolean;


  constructor(id: number, name: string, done: boolean) {
    this._id = id;
    this._name = name;
    this._done = done;
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
}
