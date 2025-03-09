import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomSnackbarComponent } from './custom-snackbar/custom-snackbar.component';

@NgModule({
  declarations: [
    CustomSnackbarComponent
  ],
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    CustomSnackbarComponent
  ]
})
export class SharedModule { } 