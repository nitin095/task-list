import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from './../../app.service';
import { MatSnackBar, MatRipple } from '@angular/material';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  @ViewChild(MatRipple) ripple: MatRipple;

  showNoFriends: Boolean = false;
  public userDetails = this.appService.getUserInfoFromLocalstorage();
  public friends: any = [];
  public friendRequests: any = [];
  public friendRequestsSent: any = [];
  public searchResults: any = [];

  constructor(private _route: ActivatedRoute, private router: Router, private appService: AppService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getAllFriends();
    if (this.userDetails.friendRequests) this.getFriendRequests()
    if (this.userDetails.friendRequestsSent) this.getFriendRequestsSent()
  }

  launchRipple() {
    const rippleRef = this.ripple.launch({
      persistent: true,
      centered: true
    });
    // Fade out the ripple later.
    rippleRef.fadeOut();
  }

  getAllFriends() {
    this.appService.getAllFriends(this.userDetails.userId).subscribe(
      response => {
        if (response.status === 200) {
          console.log(response)
          this.friends = response.data;
          this.showNoFriends = false
        } else {
          this.friends = null;
          this.showNoFriends = true;
        }
      },
      error => {
        console.log("some error occured. Cannot get freinds");
        console.log(error)
      }
    )
  }// end getAllFriends

  searchFriends(search) {
    this.launchRipple()
    this.appService.searchFriends(search).subscribe(
      response => {
        if (response.status === 200) {
          this.searchResults = response.data;
          if (!this.userDetails.friends) {
            this.searchFriends = this.searchResults.filter(person => !this.userDetails.friends.includes(person.userId))
          }
        } else {
          this.snackBar.open(response.message, 'Close', { duration: 4000 });
        }
      },
      error => {
        console.log("some error occured. Cannot get freinds");
        console.log(error)
      }
    )
  }// end searchFriends

  addFriend(friendId) {
    console.log('adding friend', friendId)
    this.appService.addFriend(this.userDetails.userId, { friendId: friendId }).subscribe(
      response => {
        if (response.status === 200) {
          this.userDetails.friendRequestsSent.push(friendId);
          this.getFriendRequestsSent()
          this.snackBar.open(response.message, 'Close', { duration: 4000 });
        } else {
          this.snackBar.open(response.message, 'Close', { duration: 4000 });
        }
      },
      error => {
        console.log("some error occured. Cannot get freinds");
        console.log(error)
      }
    )
  }// end addFriend

  getFriendRequests() {
    this.appService.getMultipleUsers(this.userDetails.friendRequests).subscribe(
      response => {
        if (response.status === 200) {
          this.friendRequests = response.data;
          console.log('friend requests found', this.friendRequests)
        } else {
          console.log(response.message)
        }
      },
      error => {
        console.log("some error occured. Cannot get freinds");
        console.log(error)
      }
    )
  }// end getFriendRequests


  getFriendRequestsSent() {
    this.appService.getMultipleUsers(this.userDetails.friendRequestsSent).subscribe(
      response => {
        if (response.status === 200) {
          this.friendRequestsSent = response.data;
          console.log('sent friend requests found', this.friendRequests)
        } else {
          console.log(response.message)
        }
      },
      error => {
        console.log("some error occured. Cannot get freinds");
        console.log(error)
      }
    )
  }// end getFriendRequests

  removeFriend(friendId) {
    this.appService.removeFriend(this.userDetails.userId, { friendId: friendId }).subscribe(
      response => {
        if (response.status === 200) {
          this.getAllFriends();
        } else {
          console.log(response.message)
        }
      },
      error => {
        console.log("some error occured. Cannot get freinds");
        console.log(error)
      }
    )
  }// end removeFriend

  handleFriendRequest(action, friendId) {
    if (action == 'accept') {
      this.appService.acceptFriendRequest(this.userDetails.userId, { friendId: friendId }).subscribe(
        response => {
          if (response.status === 200) {
            this.friendRequests = this.friendRequests.filter(x => x.userId !== friendId)
            this.userDetails.friendRequests.splice(this.userDetails.friendRequests.indexOf(friendId), 1)
            this.getAllFriends();
          } else {
            console.log(response.message)
          }
        },
        error => {
          console.log("some error occured. Cannot get freinds");
          console.log(error)
        }
      )
    } else if (action == 'ignore') {
      this.appService.ignoreReceivedRequest(this.userDetails.userId, { friendId: friendId }).subscribe(
        response => {
          if (response.status === 200) {
            this.userDetails.friendRequests.splice(this.userDetails.friendRequests.indexOf(friendId), 1);
            this.friendRequests = this.friendRequests.filter(x => x.userId !== friendId);
            this.getAllFriends();
          } else {
            console.log(response.message)
          }
        },
        error => {
          console.log("some error occured. Cannot get freinds");
          console.log(error)
        }
      )
    } else {
      this.appService.cancelSentRequest(this.userDetails.userId, { friendId: friendId }).subscribe(
        response => {
          if (response.status === 200) {
            this.userDetails.friendRequestsSent.splice(this.userDetails.friendRequestsSent.indexOf(friendId), 1)
            this.friendRequestsSent = this.friendRequestsSent.filter(x => x.userId !== friendId)
          } else {
            console.log(response.message)
          }
        },
        error => {
          console.log("some error occured. Cannot get freinds");
          console.log(error)
        }
      )
    }

  }// end handleFriendRequest

}
