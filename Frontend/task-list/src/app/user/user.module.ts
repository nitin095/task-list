import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from './..//shared/shared.module';
import { UserRoutingModule } from './user-routing.module';

import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FriendsComponent } from './friends/friends.component';
import { ProfileComponent } from './profile/profile.component';


@NgModule({
  declarations: [LoginComponent, DashboardComponent, FriendsComponent, ProfileComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    UserRoutingModule
  ]
})
export class UserModule { }
