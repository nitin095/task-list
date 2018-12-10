import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from './../../app.service'
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  showProgressBar: Boolean = false;

  //models
  public email: String;
  public password: String;
  public hide = true;

  constructor(private _route: ActivatedRoute, private router: Router, private appService: AppService, public snackBar: MatSnackBar) { }

  ngOnInit() {

  }


  login(): any {

    let loginData = {
      email: this.email,
      password: this.password,
    }// end login data

    console.log(loginData)

    this.appService.login(loginData).subscribe(

      response => {
        if (response.status === 200) {
          console.log(response)

          Cookie.set('authtoken', response.data.authToken);

          Cookie.set('receiverId', response.data.userDetails.userId);

          Cookie.set('receiverName', response.data.userDetails.firstName + ' ' + response.data.userDetails.lastName);

          this.appService.setUserInfoInLocalStorage(response.data.userDetails)

          setTimeout(() => {
            this.showProgressBar = false;
            this.router.navigate(['/dashboard']);
          }, 1000)

        } else {
          this.snackBar.open(response.message, 'Close', { duration: 4000, });
          this.showProgressBar = false;
          console.log(response.message)
        }
      },
      error => {
        this.snackBar.open(error.error.message, 'Close', { duration: 4000, });
        this.showProgressBar = false;
        console.log("some error occured");
        console.log(error)
      }

    )

  }//end login function


}
