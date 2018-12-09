import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable } from "rxjs";
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { toASCII } from 'punycode';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private baseUrl = 'http://localhost:3000/api/v1';

  private authToken: string = Cookie.get('authtoken');


  constructor(private _http: HttpClient) {
    console.log('app-service called');
  }

  private handleError(err: HttpErrorResponse) {
    console.log("Handle error Http calls")
    console.log(err.message);
    return Observable.throw(err.message)
  }


  public getUserInfoFromLocalstorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  public setUserInfoInLocalStorage = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data))
  }

  signup(data): Observable<any> {
    let response = this._http.post(`${this.baseUrl}/users/signup`, data);
    return response
  }

  login(data): Observable<any> {
    let myResponse = this._http.post(`${this.baseUrl}/users/login`, data)
    return myResponse;
  }// end login

  logout(): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authtoken'));
    return this._http.post(`${this.baseUrl}/users/logout`, params);
  } // end logout function

  getUser(userId): Observable<any> {
    this.authToken = Cookie.get('authtoken');
    let response = this._http.get(`${this.baseUrl}/users/${userId}/details?authToken=${this.authToken}`)
    return response
  }

  editUser(userId, data): Observable<any> {
    this.authToken = Cookie.get('authtoken');
    let response = this._http.put(`${this.baseUrl}/users/${userId}/edit?authToken=${this.authToken}`, data)
    return response
  }

  deleteUser(userId): Observable<any> {
    this.authToken = Cookie.get('authtoken');
    let response = this._http.post(`${this.baseUrl}/users/${userId}/delete?authToken=${this.authToken}`, '')
    return response
  }

  recoverPassword(data): Observable<any> {
    let response = this._http.put(`${this.baseUrl}/users/forgotPassword`, data)
    return response
  }

  resetPassword(data): Observable<any> {
    let response = this._http.put(`${this.baseUrl}/users/resetPassword`, data)
    return response
  }


  getAllLists(userId): Observable<any> {
    this.authToken = Cookie.get('authtoken');
    let response = this._http.get(`${this.baseUrl}/lists/all/${userId}?authToken=${this.authToken}`)
    return response
  }

  createList(listData): Observable<any> {
    let response = this._http.post(`${this.baseUrl}/lists/create`, listData)
    return response
  }

  getSingleList(listId): Observable<any> {
    let response = this._http.get(`${this.baseUrl}/lists/${listId}/details`)
    return response
  }

  editList(listId, data): Observable<any> {
    let response = this._http.put(`${this.baseUrl}/lists/${listId}/edit`, data)
    return response
  }

  getListTasks(listId): Observable<any> {
    let response = this._http.get(`${this.baseUrl}/tasks/list/${listId}`)
    return response
  }

  createTask(taskData): Observable<any> {
    let response = this._http.post(`${this.baseUrl}/tasks/create`, taskData)
    return response
  }

  addTaskComment(taskId, comment): Observable<any> {
    let response = this._http.post(`${this.baseUrl}/tasks/comment/create/${taskId}`, comment)
    return response
  }

  deleteTaskComment(taskId, comment): Observable<any> {
    let response = this._http.post(`${this.baseUrl}/tasks/${taskId}/commentDelete`, comment)
    return response
  }

  editTaskComment(taskId, comment): Observable<any> {
    let response = this._http.put(`${this.baseUrl}/tasks/${taskId}/edit/comment`, comment)
    return response
  }

  editTask(taskId, data): Observable<any> {
    let response = this._http.put(`${this.baseUrl}/tasks/${taskId}/edit`, data)
    return response
  }

  deleteTask(taskId): Observable<any> {
    let response = this._http.post(`${this.baseUrl}/tasks/${taskId}/delete`, '')
    return response
  }

  getSingleTask(taskId): Observable<any> {
    let response = this._http.get(`${this.baseUrl}/tasks/${taskId}/details`)
    return response
  }

  createSubTask(taskId, taskData): Observable<any> {
    let response = this._http.post(`${this.baseUrl}/tasks/subTask/create/${taskId}`, taskData)
    return response
  }

  deleteSubTask(taskId,subTask_id): Observable<any> {
    let response = this._http.post(`${this.baseUrl}/tasks/${taskId}/${subTask_id}/delete`,'')
    return response
  }

  setSubTaskStatus(taskId, subTask_id, isDone): Observable<any> {
    let response = this._http.put(`${this.baseUrl}/tasks/${taskId}/${subTask_id}/status`, {isDone: isDone})
    return response
  }

  getAllTasks(userId): Observable<any> {
    let response = this._http.get(`${this.baseUrl}/tasks/all/${userId}`)
    return response
  }

  getAllFriends(userId): Observable<any> {
    let response = this._http.get(`${this.baseUrl}/users/${userId}/friends`)
    return response
  }

  getMultipleUsers(userIds): Observable<any> {
    let response = this._http.get(`${this.baseUrl}/users/view/${userIds}`)
    return response
  }

  searchFriends(search): Observable<any> {
    let response = this._http.get(`${this.baseUrl}/users/friends/?search=${search}`)
    return response
  }

  addFriend(userId, friend): Observable<any> {
    let response = this._http.post(`${this.baseUrl}/users/${userId}/friends/add`, friend)
    return response
  }

  removeFriend(userId, friend): Observable<any> {
    let response = this._http.put(`${this.baseUrl}/users/${userId}/friends/remove`, friend)
    return response
  }

  acceptFriendRequest(userId, friend): Observable<any> {
    let response = this._http.put(`${this.baseUrl}/users/${userId}/friends/accept`, friend)
    return response
  }

  cancelSentRequest(userId, friend): Observable<any> {
    let response = this._http.put(`${this.baseUrl}/users/${userId}/friends/cancel`, friend)
    return response
  }

  ignoreReceivedRequest(userId, friend): Observable<any> {
    let response = this._http.put(`${this.baseUrl}/users/${userId}/friends/ignore`, friend)
    return response
  }

}

