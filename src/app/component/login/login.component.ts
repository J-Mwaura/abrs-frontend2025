import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordLoginRequest } from 'src/app/dtos/security/password-login-request';
import { PinLoginRequest } from 'src/app/dtos/security/pin-login-request';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/security/services/auth-service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
   passwordForm!: FormGroup;
  pinForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.passwordForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.pinForm = this.fb.group({
      phone: ['', Validators.required],
      pin: ['', Validators.required]
    });
  }

  // ----------------------
  // Password login submit
  // ----------------------
  onPasswordLogin() {
    if (this.passwordForm.invalid) return;

    const request: PasswordLoginRequest = this.passwordForm.value;
    this.authService.loginWithPassword(request).subscribe({
      next: (res) => {
        console.log('Login success', res);
        this.router.navigate(['/tabs/flights']); // redirect after login
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Invalid username or password';
      }
    });
  }

  // ----------------------
  // PIN login submit
  // ----------------------
  onPinLogin() {
    if (this.pinForm.invalid) return;

    const request: PinLoginRequest = this.pinForm.value;
    this.authService.loginWithPin(request).subscribe({
      next: (res) => {
        console.log('PIN login success', res);
        this.router.navigate(['/tabs/flights']); // redirect after login
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Invalid phone or PIN';
      }
    });
  }
}

