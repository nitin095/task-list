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
import { FriendCardComponent } from './friend-card/friend-card.component';


@NgModule({
  declarations: [GoogleBtnComponent, FriendCardComponent],
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
    FriendCardComponent,
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
