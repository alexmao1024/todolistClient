import {Injectable} from "@angular/core";
import {FormControl, ValidationErrors} from "@angular/forms";
import {Observable, Observer} from "rxjs";

@Injectable({providedIn: 'root'})
export class ValidatorsService {

  nameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      let regExp = /^.{1,50}$/;
      if (!regExp.test(control.value)) {
        observer.next({ error: true, regMatch: true });
      } else {
        observer.next(null);
      }
      observer.complete();
    });

  usernameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      let regExp = /^[a-zA-Z0-9_-]{4,16}$/;
      if (!regExp.test(control.value)) {
        observer.next({ error: true, regMatch: true });
      } else {
        observer.next(null);
      }
      observer.complete();
    });

  passwordAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      let regExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
      if (!regExp.test(control.value)) {
        observer.next({ error: true, regMatch: true });
      } else {
        observer.next(null);
      }
      observer.complete();
    });
}
