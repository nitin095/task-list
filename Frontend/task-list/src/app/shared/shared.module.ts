import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule,
  MatCheckboxModule,
  MatToolbarModule,
  MatCardModule,
  MatInputModule,
  MatProgressBarModule,
  MatDividerModule,
  MatIconModule,
  MatRippleModule,
  MatFormFieldModule,
  MatSelectModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatMenuModule,
  MatSnackBarModule,
  MatTooltipModule,
  MatSidenavModule,
  MatListModule
} from '@angular/material';
import { GoogleBtnComponent } from './google-btn/google-btn.component';


@NgModule({
  declarations: [GoogleBtnComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  exports: [
    CommonModule,
    GoogleBtnComponent,
    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatProgressBarModule,
    MatDividerModule,
    MatIconModule,
    MatRippleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSidenavModule,
    MatListModule
  ]
})
export class SharedModule { }
