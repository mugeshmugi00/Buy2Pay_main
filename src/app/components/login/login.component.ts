import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-white mb-2">Buy2Pay</h1>
          <h2 class="text-xl font-semibold text-blue-100 mb-8">P2P Procurement Dashboard</h2>
        </div>
        <div class="bg-white rounded-lg shadow-xl p-8">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              >
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              >
            </div>
            <div *ngIf="error" class="text-red-600 text-sm">
              {{ error }}
            </div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              <span *ngIf="loading">Signing in...</span>
              <span *ngIf="!loading">Sign In</span>
            </button>
          </form>
          
          <div class="mt-6 pt-6 border-t border-gray-200">
            <p class="text-sm text-gray-600 mb-4">Demo Credentials:</p>
            <div class="space-y-2 text-xs text-gray-500">
              <p><strong>Requester:</strong> requester&#64;buy2pay.com / password123</p>
              <p><strong>Approver:</strong> approver&#64;buy2pay.com / password123</p>
              <p><strong>Finance:</strong> finance&#64;buy2pay.com / password123</p>
              <p><strong>Admin:</strong> admin&#64;buy2pay.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, NgIf]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';
    
    console.log('Login attempt with:', this.loginForm.value);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        this.error = error.error?.error || 'Login failed. Please try again.';
      }
    });
  }
}