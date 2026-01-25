import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonInput, IonButton, IonButtons, IonMenuButton, IonSpinner } from '@ionic/angular/standalone';
import { ToastrService } from 'src/app/services/toast-service';
import { StaffType } from 'src/app/enums/stafftype';
import { AuthService } from 'src/app/security/services/auth-service';
import { RegistrationRequest } from 'src/app/dtos/security/registration-request';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem,
    IonLabel, IonInput, IonButton,
    IonButtons, IonMenuButton, IonSpinner, CommonModule, ReactiveFormsModule
]
})
export class RegisterPage implements OnInit {
  // Using NonNullable to ensure form values don't accidentally become null
  registerForm!: FormGroup;
  staffOptions = Object.values(StaffType);
  isLoading = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastrService = inject(ToastrService);

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // Adding PIN: typically 4-6 digits
      pin: ['', [Validators.required, Validators.pattern('^[0-9]{4,6}$')]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.toastrService.error('Please fill all required fields correctly.');
      return;
    }

    this.isLoading = true;
    // Cast the form value to our Interface for type safety
    const request: RegistrationRequest = this.registerForm.value;

    this.authService.register(request).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.toastrService.success('Staff member registered successfully!');
          this.registerForm.reset({ staffType: StaffType.ATTENDANT });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastrService.error(err.error?.message || 'Registration failed');
      }
    });
  }
}