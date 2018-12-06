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
  MatListModule,
  MatExpansionModule,
  MatDatepickerModule,
  MatNativeDateModule
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
    MatListModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class SharedModule { }
