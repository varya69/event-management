import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { animate, state, style, transition, trigger } from '@angular/animations';

export interface CustomSnackBarData {
  message: string;
  action?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  icon?: string;
}

@Component({
  selector: 'app-custom-snackbar',
  template: `
    <div class="custom-snackbar" 
         [ngClass]="data.type || 'info'"
         [@slideIn]="state">
      <div class="snackbar-icon" *ngIf="data.icon">
        <mat-icon>{{ data.icon }}</mat-icon>
      </div>
      <div class="snackbar-message">{{ data.message }}</div>
      <div class="snackbar-action" *ngIf="data.action">
        <button mat-button (click)="dismiss()">{{ data.action }}</button>
      </div>
      <button mat-icon-button class="close-button" (click)="dismiss()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      background: transparent !important;
    }
    
    .custom-snackbar {
      display: flex;
      align-items: center;
      min-height: 48px;
      padding: 8px 16px;
      border-radius: 4px;
      box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12);
      margin-bottom: 16px;
    }
    
    .snackbar-icon {
      margin-right: 12px;
      display: flex;
      align-items: center;
    }
    
    .snackbar-message {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }
    
    .snackbar-action {
      margin-left: 8px;
    }
    
    .close-button {
      margin-left: 8px;
      width: 24px;
      height: 24px;
      line-height: 24px;
    }
    
    .close-button .mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      line-height: 18px;
    }
    
    /* Type-specific styles */
    .success {
      background-color: #4caf50;
      color: white;
    }
    
    .error {
      background-color: #f44336;
      color: white;
    }
    
    .warning {
      background-color: #ff9800;
      color: white;
    }
    
    .info {
      background-color: #2196f3;
      color: white;
    }
    
    /* Dark theme adjustments */
    :host-context(.dark-theme) .success {
      background-color: #43a047;
    }
    
    :host-context(.dark-theme) .error {
      background-color: #e53935;
    }
    
    :host-context(.dark-theme) .warning {
      background-color: #fb8c00;
    }
    
    :host-context(.dark-theme) .info {
      background-color: #1e88e5;
    }
  `],
  animations: [
    trigger('slideIn', [
      state('void', style({
        transform: 'translateY(100%)',
        opacity: 0
      })),
      state('enter', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      state('leave', style({
        transform: 'translateY(100%)',
        opacity: 0
      })),
      transition('void => enter', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('enter => leave', animate('195ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class CustomSnackbarComponent implements OnInit {
  state = 'enter';

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: CustomSnackBarData,
    private snackBarRef: MatSnackBarRef<CustomSnackbarComponent>
  ) {}

  ngOnInit(): void {
    // Set default icon based on type if not provided
    if (!this.data.icon) {
      switch (this.data.type) {
        case 'success':
          this.data.icon = 'check_circle';
          break;
        case 'error':
          this.data.icon = 'error';
          break;
        case 'warning':
          this.data.icon = 'warning';
          break;
        case 'info':
        default:
          this.data.icon = 'info';
          break;
      }
    }
  }

  dismiss(): void {
    this.state = 'leave';
    setTimeout(() => {
      this.snackBarRef.dismiss();
    }, 150);
  }
} 