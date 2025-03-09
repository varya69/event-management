import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CustomSnackbarComponent, CustomSnackBarData } from '../components/shared/custom-snackbar/custom-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  private defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'bottom',
    panelClass: ['custom-snackbar-container']
  };

  /**
   * Show a success message
   */
  success(message: string, action: string = 'Close', duration: number = 5000): void {
    this.show({
      message,
      action,
      type: 'success',
      icon: 'check_circle'
    }, duration);
  }

  /**
   * Show an error message
   */
  error(message: string, action: string = 'Close', duration: number = 8000): void {
    this.show({
      message,
      action,
      type: 'error',
      icon: 'error'
    }, duration);
  }

  /**
   * Show a warning message
   */
  warning(message: string, action: string = 'Close', duration: number = 6000): void {
    this.show({
      message,
      action,
      type: 'warning',
      icon: 'warning'
    }, duration);
  }

  /**
   * Show an info message
   */
  info(message: string, action: string = 'Close', duration: number = 5000): void {
    this.show({
      message,
      action,
      type: 'info',
      icon: 'info'
    }, duration);
  }

  /**
   * Show a custom snackbar
   */
  show(data: CustomSnackBarData, duration: number = 5000): void {
    // Dismiss any existing snackbars first
    this.dismiss();
    
    const config: MatSnackBarConfig = {
      ...this.defaultConfig,
      duration,
      data
    };

    this.snackBar.openFromComponent(CustomSnackbarComponent, config);
  }

  /**
   * Dismiss all snackbars
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }
} 