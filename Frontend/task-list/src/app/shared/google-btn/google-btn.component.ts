import { Component, OnChanges, Input, EventEmitter, Output, OnInit } from '@angular/core';

@Component({
  selector: 'google-btn',
  templateUrl: './google-btn.component.html',
  styleUrls: ['./google-btn.component.css']
})
export class GoogleBtnComponent implements OnInit {

  @Input() theme: any;

  constructor() { }

  ngOnInit() {
    
  }

}
