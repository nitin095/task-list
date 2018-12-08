import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css']
})
export class FriendCardComponent implements OnInit {

  @Input() firstName: string;
  @Input() lastName: string;
  @Input() email: string;
  @Input() countryCode: Number;
  @Input() mobileNumber: Number;
  @Input() cardType: String;

  @Output()
  addFriend: EventEmitter<String> = new EventEmitter<String>();
  @Output()
  removeFriend: EventEmitter<String> = new EventEmitter<String>();
  @Output()
  friendRequest: EventEmitter<String> = new EventEmitter<String>();

  constructor() { }

  ngOnInit() {
  }

  add_Friend() {
    this.addFriend.emit();
  }

  remove_friend() {
    this.removeFriend.emit();
  }

  accept_request() {
    this.friendRequest.emit('accept');
  }

  ignore_request() {
    this.friendRequest.emit('ignore')
  }

  cancel_request() {
    this.friendRequest.emit('cancel')
  }

}
