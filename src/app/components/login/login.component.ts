import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  returnUrl: string;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {
    // Redirect to home if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
    
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit(): void {}

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.snackbarService.warning('Please enter a valid email and password.');
      return;
    }

    this.loading = true;
    this.authService.login(this.f.email.value, this.f.password.value)
      .subscribe(
        response => {
          if (response && response.user) {
            this.snackbarService.success(`Welcome back, ${response.user.name}!`);
            this.router.navigate([this.returnUrl]);
          } else {
            this.snackbarService.error('Invalid email or password');
            this.loading = false;
          }
        },
        error => {
          this.snackbarService.error('Login failed: ' + error.message);
          this.loading = false;
        }
      );
  }
} 