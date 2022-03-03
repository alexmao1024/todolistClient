import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, tap} from "rxjs/operators";
import {BehaviorSubject, throwError} from "rxjs";
import {Router} from "@angular/router";
import {User} from "../model/user.model";

export interface AuthResponseData {
  id: string;
  username: string;
  token: string;
  expiresIn: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient,private router: Router) {
  }

  signUp(username: string,password: string) {
    return this.http.post<AuthResponseData>('https://127.0.0.1:8000/signUp',
      {
        username: username,
        password: password
      }).pipe(catchError(AuthService.handleError),
      tap(resData => {
        this.handleAuthentication(
          resData.username,
          resData.id,
          resData.token,
          +resData.expiresIn
        );
      }));
  }

  login(username: string, password: string) {
    return this.http.post<AuthResponseData>('https://127.0.0.1:8000/login',
      {
        username: username,
        password: password
      }).pipe(catchError(AuthService.handleError),
      tap(resData => {
        this.handleAuthentication(
          resData.username,
          resData.id,
          resData.token,
          +resData.expiresIn
        );
      }));
  }

  autoLogin() {
    const userData: {
      username: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.username,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    )

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/host']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(()=>{
      this.logout();
    },expirationDuration);
  }

  private handleAuthentication(
    username: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    const expirationDate = new Date(expiresIn * 1000);
    const user = new User(username, userId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000 - new Date().getTime());
    localStorage.setItem('userData',JSON.stringify(user));
  }

  private static handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'USERNAME_EXISTS':
        errorMessage = 'This email exists already.';
        break;
      case 'USERNAME_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
    }
    return throwError(errorMessage);
  }
}
