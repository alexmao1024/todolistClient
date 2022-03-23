export class Task {
  private _id:number;
  private _name:string;
  private _content:string;
  private _startTime:string;
  private _endTime:string;
  private _done:boolean;


  constructor(id: number, name: string, content: string, startTime: string, endTime: string, done: boolean) {
    this._id = id;
    this._name = name;
    this._content = content;
    this._startTime = startTime;
    this._endTime = endTime;
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

  get content(): string {
    return this._content;
  }

  set content(value: string) {
    this._content = value;
  }

  get startTime(): string {
    return this._startTime;
  }

  set startTime(value: string) {
    this._startTime = value;
  }

  get endTime(): string {
    return this._endTime;
  }

  set endTime(value: string) {
    this._endTime = value;
  }

  get done(): boolean {
    return this._done;
  }

  set done(value: boolean) {
    this._done = value;
  }
}
