import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from './../../app.service'
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  showProgressBar = true;
  public userDetails = this.appService.getUserInfoFromLocalstorage();
  public lists = [];
  public activeList: any;
  public allTasks = [];
  public activeListTasks = [];
  public activeListNotes: string;

  constructor(private _route: ActivatedRoute, private router: Router, private appService: AppService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getAllLists()
  }

  makeListActive(list) {
    this.activeList = list;
    this.getActiveListTasks(list.listId)
  }


  setListNote(note) {
    this.activeListNotes = note;
    this.activeList.notes = note;
    let editData = {
      notes: note
    }
    this.appService.editList(this.activeList.listId, editData).subscribe(
      response => {
        if (response.status === 200) {
          console.log(response.data)
        } else {
          this.snackBar.open(response.message, 'Close', { duration: 4000, });
          console.log(response.message)
        }
      },
      error => {
        console.log("some error occured. Couldn't save list notes");
        console.log(error)
      }
    )
  }// end setListNote

  getAllLists() {
    this.appService.getAllLists(this.userDetails.userId).subscribe(
      response => {
        this.showProgressBar = false;
        if (response.status === 200) {
          this.lists = response.data;
          console.log(response.data)
        } else {
          this.snackBar.open(response.message, 'Close', { duration: 4000, });
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
  }// end getAllLists

  createNewList(title) {

    let requestData = {
      createdBy: this.userDetails.userId,
      title: title
    }

    this.appService.createList(requestData).subscribe(
      response => {
        if (response.status === 200) {
          this.lists.push(response.data)
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
  }// end createNewList

  getActiveListTasks(listId) {
    this.appService.getListTasks(listId).subscribe(
      response => {
        if (response.status === 200) {
          this.activeListTasks = response.data
          console.log(response.data)
        } else {
          this.activeListTasks = null;
          console.log(response.message)
        }
      },
      error => {
        this.snackBar.open(error.error.message, 'Close', { duration: 4000, });
        console.log("some error occured");
        console.log(error)
      }
    )
  }

  createNewTask(title) {
    console.log(`creating new task: ${title}`)
    let taskData = {
      listId: this.activeList.listId,
      createdBy: this.userDetails.userId,
      title: title
    }

    this.appService.createTask(taskData).subscribe(
      response => {
        if (response.status === 200) {
          this.getActiveListTasks(this.activeList.listId)
          console.log(response.data)
        } else {
          this.snackBar.open(response.message, 'Close', { duration: 4000, });
          console.log(response.message)
        }
      },
      error => {
        this.snackBar.open(error.error.message, 'Close', { duration: 4000, });
        console.log("some error occured");
        console.log(error)
      }
    )
  }// end createNewTask

}// end DashboardComponent class
