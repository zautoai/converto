import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { availableHours, daysOfWeek, eventDuration } from 'src/app/common/constant';
import { availableHour } from 'src/app/common/intefaces';
import { stringToArray } from 'src/app/common/utils';
import { API } from 'src/app/config/endpoint.config';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';

@Component({
  selector: 'app-calendar-schedule',
  templateUrl: './calendar-schedule.component.html',
  styleUrl: './calendar-schedule.component.scss'
})
export class CalendarScheduleComponent implements OnInit{
  readonly daysOfWeek = daysOfWeek;
  readonly availableHours = availableHours;
  calendars:any[] = [];
  schedule:any = null;
  originalSchedule:any = null;
  selectedAvailableHours: availableHour[] = [];
  eventDuration = eventDuration;
  selectedEventDuration:number = 15;
  selectedCalendar:string | null = null; 
  availableDays:string[] = [];
  isLoading:boolean = false;

  @Output() onCancel = new EventEmitter<any>();

  constructor(
    private restService: RestService,
    private notifiService: NotificationService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.getSchedule();
    this.getCalendars();
  }

  selectAvailableDays(index: number)
  {
    if(index > -1)
    {
      const day = daysOfWeek[index];
      if(this.availableDays.includes(day))
      {
        this.availableDays.splice(this.availableDays.indexOf(day),1);
      }
      else
      {
        this.availableDays.push(day);
      }      
    }
    else
    {
      console.error('Invalid index');
    }
  }

  addAvailableHour() {
    const newTime: availableHour = { start: '09:00', end: '18:00' };
    this.selectedAvailableHours.push(newTime);    
  }

  removeAvailableHour(index: number) {
    this.selectedAvailableHours.splice(index, 1);
  }


  getSchedule()
  {
    this.isLoading = true;
    this.restService.getAll(API.main.schedule)
    .subscribe({
      next:(response:any)=>{
        this.schedule = {...response};
        this.availableDays = stringToArray(this.schedule.availableDays,',');   
        this.handleAvailableHours(this.schedule.availableHours);     
        this.selectedEventDuration = this.schedule.eventDuration;
        this.selectedCalendar = this.schedule.calendarId;
        this.originalSchedule = {...this.schedule};
        this.isLoading = false;
      },
      error:(error)=>{
        this.isLoading = false;
        console.log(error);
        // this.notifiService.showError(error.error.message);
      }
    });
  }

  handleAvailableHours(data:any)
  {
    this.selectedAvailableHours.splice(0,this.selectedAvailableHours.length)
    for(let hour of data)
    {
      const newTime: availableHour = { start: hour.start, end: hour.end };
      this.selectedAvailableHours.push(newTime);
    }
  }

  checkDateSelected(day:string):boolean
  {    
    return this.availableDays.includes(day);
  }

  getCalendars()
  {
    this.isLoading = true;
    this.restService.getAll(API.main.calendar)
    .subscribe({
      next:(response:any)=>{
        console.log(response);
        this.calendars = response || [];
        this.isLoading = false;
      },
      error:(error)=>{
        this.isLoading = false;
        console.log(error);
      }
    })
  }

  onSaveSubmit()
  {
    const payload = {
      availableDays: this.availableDays,
      availableHours: this.selectedAvailableHours,
      eventDuration: Number(this.selectedEventDuration),
      calendarId: this.selectedCalendar,
    }

    if(!this.schedule)
    {
      this.isLoading = true;
      this.restService.post(API.main.schedule,payload)
      .subscribe({
        next:(response:any)=>{
          this.getSchedule();
          this.isLoading = false;
          this.notifiService.showSuccess('Availability schedule created');
        },
        error:(error)=>{
          console.log(error);
          this.isLoading = false;
          // this.notifiService.showError(error.error.message);
        }
      });
    }
    else
    {
      this.isLoading = true;
      this.restService.patch(API.main.schedule,this.schedule.id,payload)
      .subscribe({
        next:(response:any)=>{
          this.getSchedule();
          this.isLoading = false;
          this.notifiService.showSuccess('Availability schedule updated');
        },
        error:(error)=>{
          console.log(error);
          this.isLoading = false;
          // this.notifiService.showError(error.error.message);
        }
      });
    }
  }

  cancel() {
    this.onCancel.emit();
  }
}
