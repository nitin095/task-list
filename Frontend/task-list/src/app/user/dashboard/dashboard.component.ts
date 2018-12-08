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
  public showTasksList: Boolean = true;
  public activeListTasks = [];
  public activeListNotes: string;
  public activeListCompletedTasks: number;
  public tasksProgress: number;
  public activeTask: any;

  constructor(private _route: ActivatedRoute, private router: Router, private appService: AppService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getAllLists(true);
    this._route.queryParams.subscribe(params => {
      if (params['taskId']) {
        this.showProgressBar = true;
        setTimeout(() => {
          this.getSingleTask(params['taskId'])
          setTimeout(() => {
            let list = this.lists.map(i => i.listId == this.activeTask.listId ? i : '');
            list = list.filter(x=>x)
            console.log(list[0])
            this.makeListActive(list[0])
            this.showTasksList = false;
            this.showProgressBar = false
          }, 2000)
        }, 2000)
      }else{
      }
    });
  }

  makeListActive(list) {
    this.activeList = list;
    this.getActiveListTasks(list.listId)
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
          if(onInit) this.makeListActive(this.lists[0])
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

  saveSubTask(subTask) {
    let editData = {
      dueDate: subTask.dueDate,
      isDone: subTask.isDone,
      title: subTask.title,
    }
    this.appService.editTask(subTask._id, editData).subscribe(
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

}// end DashboardComponent class
