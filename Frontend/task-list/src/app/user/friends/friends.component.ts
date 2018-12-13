import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from './../../app.service';
import { SocketService } from './../../socket.service';
import { MatSnackBar, MatRipple } from '@angular/material';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css'],
  // providers: [Location, SocketService]
})
export class FriendsComponent implements OnInit {

  @ViewChild(MatRipple) ripple: MatRipple;

  notification: any;
  showNoFriends: Boolean = false;
  public userDetails = this.appService.getUserInfoFromLocalstorage();
  public friends: any = [];
  public friendRequests: any = [];
  public friendRequestsSent: any = [];
  public searchResults: any = [];

  constructor(private _route: ActivatedRoute, private router: Router, private appService: AppService, public SocketService: SocketService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    // this.getNotifications();
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

    this.userDetails = this.appService.getUserInfoFromLocalstorage()

    if (this.userDetails.friends.length !== 0) {
      this.appService.getMultipleUsers(this.userDetails.friends).subscribe(
        response => {
          if (response.status === 200) {
            this.friends = response.data;
            this.showNoFriends = false
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
      this.friends = null;
      this.showNoFriends = true;
    }

  }// end getAllFriends

  getFriendRequests() {

    this.userDetails = this.appService.getUserInfoFromLocalstorage()

    if (this.userDetails.friendRequests.length !== 0) {
      this.appService.getMultipleUsers(this.userDetails.friendRequests).subscribe(
        response => {
          if (response.status === 200) {
            this.friendRequests = response.data;
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
      this.friendRequests = null
    }

  }// end getFriendRequests

  getFriendRequestsSent() {

    this.userDetails = this.appService.getUserInfoFromLocalstorage()

    if (this.userDetails.friendRequestsSent.length !== 0) {
      this.appService.getMultipleUsers(this.userDetails.friendRequestsSent).subscribe(
        response => {
          if (response.status === 200) {
            this.friendRequestsSent = response.data;
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
      this.friendRequestsSent = null
    }

  }// end getFriendRequests

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
    this.appService.addFriend(this.userDetails.userId, { friendId: friendId }).subscribe(
      response => {
        if (response.status === 200) {
          this.appService.setUserInfoInLocalStorage(response.data)
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

  removeFriend(friendId) {
    this.appService.removeFriend(this.userDetails.userId, { friendId: friendId }).subscribe(
      response => {
        if (response.status === 200) {
          this.appService.setUserInfoInLocalStorage(response.data)
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
            this.appService.setUserInfoInLocalStorage(response.data);
            this.getFriendRequests();
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
            this.appService.setUserInfoInLocalStorage(response.data)
            this.getFriendRequests()
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
            this.appService.setUserInfoInLocalStorage(response.data);
            this.getFriendRequestsSent();
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

  getNotifications(): any {

    this.SocketService.notification().subscribe((data) => {

      this.notification = { type: data.type, event: data.event, message: '', friendId: data.friendId, friendName: data.friendName, time: data.time, display: true }

      if (data.event === 'Friend request received') {
        this.getFriendRequests()
      } else if (data.event == 'Friend request accepted') {
        this.getAllFriends();
        this.getFriendRequestsSent();
      } else if (data.event == 'Friend request declined') {
        this.getFriendRequestsSent()
      } else if (data.event == 'Friend removed') {
        this.getAllFriends()
      }

    });
  }

}
