import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-under-construction',
  templateUrl: './under-construction.component.html',
  styleUrls: ['./under-construction.component.scss']
})
export class UnderConstructionComponent implements OnInit {
  public days!: number;
  public hours!: number;
  public minutes!: number;
  public seconds!: number;
  constructor() { }
ngOnInit(): void {
  let countDown = new Date('jul 1, 2024 00:00:00').getTime();
  let time = setInterval(()=>{
    let now = new Date().getTime();
    let distance = countDown - now;
    this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / ( 1000 * 60 * 60));
    this.minutes = Math.floor((distance % (1000 * 60 * 60)) / ( 1000 * 60 ));
    this.seconds = Math.floor((distance % (1000 * 60 )) / 1000);

    if(distance < 0){
      clearInterval(time);
    }
  }, 1000)
}
}
