import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from './app.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'task-list';
  url: string = "";
  userDetails = this.appService.getUserInfoFromLocalstorage();
  searchResults: [];
  showResults: Boolean = false;

  constructor(private router: Router, private appService: AppService, public snackBar: MatSnackBar) {
    router.events.subscribe((val) => {
      this.url = this.router.url;
    });
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

}
