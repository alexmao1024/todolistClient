import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthResponseData, AuthService} from "../../service/auth.service";
import {Observable} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  validateForm!: FormGroup;
  isLogin: boolean = false;
  isLoginMode: boolean = true;
  isLoading: boolean = false;
  error: string;

  constructor(private authService:AuthService,private router:Router,private fb: FormBuilder) {
  }

  submitForm(): void {
    if (this.validateForm.valid){
      const username = this.validateForm.value.username;
      const password = this.validateForm.value.password;

      let authObs: Observable<AuthResponseData>

      this.isLoading = true;
      if (this.isLoginMode){
        authObs = this.authService.login(username,password);
      }else {
        authObs = this.authService.signUp(username,password);
      }

      authObs.subscribe(
        resData => {
          this.isLoading = false;
          this.isLogin = true;
          this.router.navigate(['/lists']);
        },
        errorMessage => {
          this.error = errorMessage;
          this.isLoading = false;
        }
      );
      this.validateForm.reset();
    }else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }


  ngOnInit(): void {
    this.validateForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
  }

  onSwitch() {
    this.isLoginMode = !this.isLoginMode;
  }

}
