import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {
    // Redirect to home if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
    
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      this.snackbarService.warning('Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;
    const user = {
      name: this.f.name.value,
      email: this.f.email.value,
      password: this.f.password.value,
      role: 'user' as 'user' | 'admin'
    };

    this.authService.register(user)
      .subscribe(
        response => {
          this.snackbarService.success(`Welcome, ${user.name}! Registration successful.`);
          this.router.navigate(['/']);
        },
        error => {
          this.snackbarService.error('Registration failed: ' + error.message);
          this.loading = false;
        }
      );
  }
} 