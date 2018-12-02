import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable } from "rxjs";
import { Cookie } from 'ng2-cookies/ng2-cookies';

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

  editUser(userType, userId, data): Observable<any> {
    this.authToken = Cookie.get('authtoken');
    let response = this._http.put(`${this.baseUrl}/${userType}/${userId}/edit?authToken=${this.authToken}`, data)
    return response
  }

  deleteUser(userType, userId): Observable<any> {
    this.authToken = Cookie.get('authtoken');
    let response = this._http.post(`${this.baseUrl}/${userType}/${userId}/delete?authToken=${this.authToken}`, '')
    return response
  }

  recoverPassword(userType, data): Observable<any> {
    let response = this._http.put(`${this.baseUrl}/${userType}/forgotPassword`, data)
    return response
  }

  resetPassword(userType, data): Observable<any> {
    let response = this._http.put(`${this.baseUrl}/${userType}/resetPassword`, data)
    return response
  }


}
