export class Task {
  private _id;
  private _name;
  private _content;
  private _startTime;
  private _endTime;
  private _done;


  constructor(id, name, content, startTime, endTime, done) {
    this._id = id;
    this._name = name;
    this._content = content;
    this._startTime = startTime;
    this._endTime = endTime;
    this._done = done;
  }


  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = value;
  }

  get content() {
    return this._content;
  }

  set content(value) {
    this._content = value;
  }

  get startTime() {
    return this._startTime;
  }

  set startTime(value) {
    this._startTime = value;
  }

  get endTime() {
    return this._endTime;
  }

  set endTime(value) {
    this._endTime = value;
  }

  get done() {
    return this._done;
  }

  set done(value) {
    this._done = value;
  }
}
