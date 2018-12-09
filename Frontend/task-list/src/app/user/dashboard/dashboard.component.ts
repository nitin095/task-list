import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from './../../app.service'
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { SocketService } from './../../socket.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';

//importing ng-fullCalender 
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [Location, SocketService]
})

export class DashboardComponent implements OnInit, OnDestroy {

  mobileQuery: MediaQueryList;
  showProgressBar = true;
  public authToken: any;
  public userDetails = this.appService.getUserInfoFromLocalstorage();
  public lists = [];
  public activeList: any;
  public allTasks = [];
  public showTasksList: Boolean = true;
  public activeListTasks = [];
  public activeListNotes: string;
  public activeListCompletedTasks: number;
  public tasksProgress: number;
  public activeTask: any;
  public notification: any;

  private _mobileQueryListener: () => void;

  calendarOptions: Options;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  constructor(private _route: ActivatedRoute, private router: Router, private appService: AppService, public snackBar: MatSnackBar, public SocketService: SocketService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {

    this.getAllLists(true);
    this.getAllTasks();
    this.authToken = Cookie.get('authtoken');
    this.verifyUserConfirmation();
    this.getNotifications();

    this._route.queryParams.subscribe(params => {
      if (params['taskId']) {
        this.showProgressBar = true;
        setTimeout(() => {
          this.getSingleTask(params['taskId'])
          setTimeout(() => {
            let list = this.lists.map(i => i.listId == this.activeTask.listId ? i : '');
            list = list.filter(x => x)
            console.log(list[0])
            this.makeListActive(list[0])
            this.showTasksList = false;
            this.showProgressBar = false
          }, 2000)
        }, 2000)
      } else {
      }
    });

  }// end ngOnInit 

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  makeListActive(list) {
    this.activeList = list;
    this.getActiveListTasks(list.listId);
    this.calendarOptions = null
  }

  loadTask(task) {
    console.log(task)
    this.showTasksList = false;
    this.activeTask = task;
  }

  setTaskStatus(task) {
    let editData = {
      isDone: task.isDone
    }
    task.isDone ? this.activeListCompletedTasks++ : this.activeListCompletedTasks--;
    this.tasksProgress = (this.activeListCompletedTasks / this.activeListTasks.length) * 100;
    this.appService.editTask(task.taskId, editData).subscribe(
      response => {
        if (response.status === 200) {
          console.log(response)
        } else {
          this.snackBar.open(response.message, 'Close', { duration: 4000 });
          console.log(response.message)
        }
      },
      error => {
        console.log("some error occured. Couldn't save list status");
        console.log(error)
      }
    )
  }// end setTaskStatus

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

  getAllLists(onInit?) {
    this.appService.getAllLists(this.userDetails.userId).subscribe(
      response => {
        this.showProgressBar = false;
        if (response.status === 200) {
          this.lists = response.data;
          console.log(response.data)
          if (onInit) this.makeListActive(this.lists[0])
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

  getAllTasks() {
    this.showProgressBar = true;
    this.appService.getAllTasks(this.userDetails.userId).subscribe(
      response => {
        this.showProgressBar = false;
        if (response.status === 200) {
          this.allTasks = response.data;
        } else {
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
  }// end getAllTasks

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
          this.activeListTasks = response.data;
          this.showProgressBar = false;
          this.activeListCompletedTasks = this.activeListTasks.filter(task => task.isDone).length;
          this.tasksProgress = (this.activeListCompletedTasks / this.activeListTasks.length) * 100;
          console.log(response.data)
        } else {
          this.activeListTasks = null;
          this.activeListCompletedTasks = 0;
          this.tasksProgress = 0;
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
    this.showProgressBar = true;
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

  saveTask(field) {
    console.log('saving task', field)
    this.appService.editTask(this.activeTask.taskId, field).subscribe(
      response => {
        if (response.status === 200) {
          console.log(response)
        } else {
          this.snackBar.open(response.message, 'Close', { duration: 4000 });
          console.log(response.message)
        }
      },
      error => {
        console.log("some error occured. Couldn't save list status");
        console.log(error)
      }
    )
  }// end saveTask

  deleteTask(taskId) {
    this.appService.deleteTask(taskId).subscribe(
      response => {
        if (response.status === 200) {
          this.showTasksList = true;
          this.getActiveListTasks(this.activeList.listId);
          this.snackBar.open('Task deleted', 'Close', { duration: 4000 });
          console.log(response)
        } else {
          this.snackBar.open(response.message, 'Close', { duration: 4000 });
          console.log(response.message)
        }
      },
      error => {
        console.log("some error occured. Couldn't save list status");
        console.log(error)
      }
    )
  }

  saveSubTask(id, status) {
    console.log('saving', this.activeTask.taskId, id, status)
    this.appService.setSubTaskStatus(this.activeTask.taskId, id, status).subscribe(
      response => {
        if (response.status === 200) {
          console.log(response)
        } else {
          this.snackBar.open(response.message, 'Close', { duration: 4000 });
          console.log(response.message)
        }
      },
      error => {
        console.log("some error occured. Couldn't save sub task");
        console.log(error)
      }
    )
  }

  getSingleTask(taskId) {
    this.appService.getSingleTask(taskId).subscribe(
      response => {
        if (response.status === 200) {
          this.activeTask = response.data;
          this.activeListTasks = this.activeListTasks.map((e, i) => e.taskId == this.activeTask.taskId ? e = this.activeTask : e)
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
  }

  addComment(comment) {
    let commentData = {
      createdBy: this.userDetails.userId,
      body: comment
    }
    console.log('adding comment', commentData)
    this.appService.addTaskComment(this.activeTask.taskId, commentData).subscribe(
      response => {
        if (response.status == 200) {
          this.activeTask.comments.push(commentData)
          console.log(response)
        } else {
          console.log(response.message)
        }
      },
      error => {
        console.log(error)
      }
    )
  }// end addComment

  deleteComment(commentId) {
    this.appService.deleteTaskComment(this.activeTask.taskId, { comment_id: commentId }).subscribe(
      response => {
        if (response.status === 200) {
          this.snackBar.open('Comment deleted', 'Close', { duration: 4000, });
          this.getSingleTask(this.activeTask.taskId);
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
  }

  editComment(commentId, body) {
    let comment = {
      comment_id: commentId,
      body: body
    }
    this.appService.editTaskComment(this.activeTask.taskId, comment).subscribe(
      response => {
        if (response.status === 200) {
          this.snackBar.open('Comment edited', 'Close', { duration: 4000, });
          this.getSingleTask(this.activeTask.taskId);
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
  }

  createNewSubTask(title) {
    let data = {
      createdBy: this.userDetails.userId,
      title: title
    }
    this.appService.createSubTask(this.activeTask.taskId, data).subscribe(
      response => {
        if (response.status === 200) {
          this.getSingleTask(this.activeTask.taskId)
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
  }

  deleteSubTask(id) {
    this.appService.deleteSubTask(this.activeTask.taskId, id).subscribe(
      response => {
        if (response.status === 200) {
          this.getSingleTask(this.activeTask.taskId)
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
  }

  loadCalender(): any {

    this.calendarOptions = {
      editable: false,
      eventLimit: false,
      header: {
        left: 'prev,next today',
        center: '',
        right: 'title',
      },
      timezone: 'local',
      eventTextColor: 'white',
      timeFormat: 'h(:mm)t',
      height: 'parent'
    };//end calenderOptions

  }

  verifyUserConfirmation: any = () => {
    this.SocketService.verifyUser()
      .subscribe((data) => {
        this.SocketService.setUser(this.authToken);
      });
  }

  getNotifications(): any {
    this.SocketService.notification().subscribe((data) => {
      console.log('NOTIFICATION RECEIVED FROM SERVER!')
      console.log(data);
      this.notification = { event: data.event, friendId: data.friendId, userName: data.userName, display: true }
      if (data.event === 'Friend request received') {
        this.userDetails.friendRequests.push(data.friendId)
        this.appService.setUserInfoInLocalStorage(this.userDetails)
      }
    });
  }//end getAlerts

}// end DashboardComponent class
