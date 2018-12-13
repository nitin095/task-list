import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from './app.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { MatSnackBar } from '@angular/material';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // providers: [Location, SocketService]
})

export class AppComponent implements OnInit {
  title = 'task-list';
  authToken: any;
  url: string = "";
  userDetails = this.appService.getUserInfoFromLocalstorage();
  searchResults: [];
  showResults: Boolean = false;
  notification: any;

  constructor(private router: Router, private appService: AppService, public SocketService: SocketService, public snackBar: MatSnackBar) {
    router.events.subscribe((val) => {
      this.url = this.router.url;
    });
  }

  ngOnInit() {
    this.authToken = Cookie.get('authtoken');
    this.verifyUserConfirmation();
    this.getNotifications();
  }


  public logout: any = () => {
    this.userDetails = this.appService.getUserInfoFromLocalstorage();
    this.appService.logout().subscribe((apiResponse) => {
      if (apiResponse.status === 200) {
        this.snackBar.open('Logged out sucessfully!', 'Close', { duration: 4000, });
        console.log(apiResponse)
        Cookie.delete('authtoken');
        Cookie.delete('receiverId');
        Cookie.delete('receiverName');
        this.router.navigate(['/']);
      } else {
        console.log(apiResponse.message)
      } // end condition
    }, (err) => {
      this.snackBar.open('Some error occured', 'Close', { duration: 4000, });
      console.log('some error occured')
    });
  } // end logout


  getInitials() {
    let initials = `${this.userDetails.firstName[0]}${this.userDetails.lastName[0]}`
    return initials
  }

  searchTasks(search) {
    this.appService.getAllTasks(this.userDetails.userId).subscribe(
      response => {
        this.searchResults = response.data.filter(task => task.title.includes(search))
        this.showResults = true;
      },
      error => {
        console.log(error)
      }
    )
  }// end searchUsers


  verifyUserConfirmation: any = () => {
    this.SocketService.verifyUser()
      .subscribe((data) => {
        this.SocketService.setUser(this.authToken);
      });
  }

  getNotifications(): any {

    this.SocketService.notification().subscribe((data) => {
      console.log(`%cNotification received!`, 'color:blue;font-weight:bold');
      console.log(data);

      this.notification = { type: data.type, event: data.event, message: '', friendId: data.friendId, friendName: data.friendName, time: data.time, display: true }

      if (data.type == 'request') {
        if (data.event === 'Friend request received') {
          this.userDetails.friendRequests.push(data.friendId);
          this.notification.message = `${data.friendName} has sent you a friend request`
        } else if (data.event == 'Friend request accepted') {
          this.userDetails.friends.push(data.friendId)
          this.userDetails.friendRequestsSent.splice(this.userDetails.friendRequestsSent.indexOf(data.friendId), 1)
          this.notification.message = `${data.friendName} has accepted your friend request`
        } else if (data.event == 'Friend request declined') {
          this.userDetails.friendRequestsSent.splice(this.userDetails.friendRequestsSent.indexOf(data.friendId), 1)
          this.notification.message = `${data.friendName} has declined your friend request`
        } else if (data.event == 'Friend removed') {
          this.userDetails.friends.splice(this.userDetails.friends.indexOf(data.friendId), 1)
          this.notification.message = `${data.friendName} has removed you from their friend list`
        }
      } else {

      }

      this.appService.setUserInfoInLocalStorage(this.userDetails)

    });

  }//end getAlerts



}// end Class
