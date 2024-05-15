import { Component, OnInit } from '@angular/core';
import { API } from 'src/app/config/endpoint.config';
import { RestService } from 'src/app/shared/services/rest.service';

@Component({
  selector: 'app-calendar-event',
  templateUrl: './calendar-event.component.html',
  styleUrls: ['./calendar-event.component.scss']
})
export class CalendarEventComponent implements OnInit{

  eventsList:any = [];
  selectedDate!:string;
  isLoading:boolean = false;

  constructor(
    private restService: RestService,
  ){
    this.selectedDate = new Date().toISOString().substring(0, 10);
  }

  ngOnInit(): void {
    this.getAllEvents()
  }

  getAllEvents() {
    this.isLoading = true;
    const date = new Date(this.selectedDate) || new Date();
    this.restService.getAll(API.main.calendar + `/events/${date.toISOString()}`)
    .subscribe({
      next:(response:any)=>{
        this.eventsList = response;
        this.isLoading = false;
      },
      error:(error)=>{
        console.log(error);
        this.isLoading = false;
      }
    });
  }
}
