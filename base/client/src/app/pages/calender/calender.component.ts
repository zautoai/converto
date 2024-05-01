import { Component, OnInit } from '@angular/core';
import {
  availableHours,
  daysOfWeek,
  eventDuration,
  integrationConfigs,
} from 'src/app/common/constant';
import { IntegrationConfig, availableHour } from 'src/app/common/intefaces';
import { stringToArray } from 'src/app/common/utils';
import { API } from 'src/app/config/endpoint.config';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.scss'],
})
export class CalenderComponent implements OnInit {

  GLOBAL_IMAGES = GLOBAL_IMAGES;
  readonly provider:string = 'google';
  readonly daysOfWeek = daysOfWeek;
  readonly availableHours = availableHours;
  calendars:any[] = [];
  profiles:any = {};
  schedule:any = null;
  originalSchedule:any = null;
  selectedAvailableHours: availableHour[] = [];
  integrationConfigs: IntegrationConfig[] = integrationConfigs;
  eventDuration = eventDuration;
  selectedEventDuration:number = 15;
  selectedCalendar:string | null = null; 
  availableDays:string[] = [];
  canEdit:boolean = false;
  isSubmitting:boolean = false

  constructor(
    private restService: RestService,
    private notifiService: NotificationService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.handleIntegrationConfigs();
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

  toggleEditMode(value:boolean)
  {
    this.canEdit = value;
    if(!this.canEdit)
    {
      this.schedule = {...this.originalSchedule};
      this.availableDays = stringToArray(this.schedule.availableDays,',');   
      this.handleAvailableHours(this.schedule.availableHours);     
      this.selectedEventDuration = this.schedule.eventDuration;
      this.selectedCalendar = this.schedule.calendarId;
      this.originalSchedule = {...this.schedule};
    }
  }

  getSchedule()
  {
    this.restService.getAll(API.main.schedule)
    .subscribe({
      next:(response:any)=>{
        this.schedule = {...response};
        this.availableDays = stringToArray(this.schedule.availableDays,',');   
        this.handleAvailableHours(this.schedule.availableHours);     
        this.selectedEventDuration = this.schedule.eventDuration;
        this.selectedCalendar = this.schedule.calendarId;
        this.originalSchedule = {...this.schedule};
      },
      error:(error)=>{
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
      this.isSubmitting = true;
      this.restService.post(API.main.schedule,payload)
      .subscribe({
        next:(response:any)=>{
          this.getSchedule();
          this.toggleEditMode(false);
          this.isSubmitting = false;
          this.notifiService.showSuccess('Availability schedule created');
        },
        error:(error)=>{
          console.log(error);
          this.isSubmitting = false;
          // this.notifiService.showError(error.error.message);
        }
      });
    }
    else
    {
      this.isSubmitting = true;
      this.restService.patch(API.main.schedule,this.schedule.id,payload)
      .subscribe({
        next:(response:any)=>{
          this.getSchedule();
          this.toggleEditMode(false);
          this.isSubmitting = false;
          this.notifiService.showSuccess('Availability schedule updated');
        },
        error:(error)=>{
          console.log(error);
          this.isSubmitting = false;
          // this.notifiService.showError(error.error.message);
        }
      });
    }
  }

  getProfileFromProviders(provider: string)
  {
    const endpoint = API.main.oauthProfile.replaceAll('{{provider}}',provider);
    this.restService.getAll(endpoint)
    .subscribe((response:any)=>{
      this.profiles[provider] = response;
    },(error)=>{
      console.log(error);
      // this.notifiService.showError(error.error.message);
    });   

  }

  getCalendars()
  {
    this.restService.getAll(API.main.googleCalendar)
    .subscribe({
      next:(response:any)=>{
        console.log(response);
        this.calendars = response?.items || [];
      },
      error:(error)=>{
        console.log(error);
        // this.notifiService.showError(error.error.message);
      }
    })
  }

  handleIntegrationConfigs() {
    let checkByState = false;
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has('code') && queryParams.has('state') && !checkByState) {
      const payload = { token: queryParams.get('state') };
      checkByState = true;
      this.restService.post(API.main.oauthStateToken, payload)
      .subscribe(
          (response: any) => {
            const provider = response.provider;
            const endpoint = API.main.oauthCallback.replace('{{provider}}', provider);
            const fullAuthUrl = endpoint + '?' + queryParams.toString();

            if (this.authService.getUser()) {
              this.restService.getAll(fullAuthUrl)
                .subscribe(
                  (response: any) => {
                    this.getProfileFromProviders(provider);
                    this.getCalendars();
                    this.getSchedule();
                    this.notifiService.showSuccess(`Successfully connected with ${response.provider}`);
                  },
                  (error) => {
                    console.error('Error while retrieving profile:', error);
                  }
                );
            } else {
              console.warn('User not logged in, cannot retrieve profile');
            }
          },
          (error) => {
            console.error('Error checking state token:', error);
          }
        );

      history.replaceState('', '', window.location.pathname); 
    }
    this.getProfileFromProviders(this.provider);
    this.getCalendars();
    this.getSchedule();
  }

  onConnectClick(provider: string)
  {    
    if(this.authService.getUser())
    {
      this.restService.get(API.main.oauth,provider + `?orgId=${this.authService.getUser().orgId}`)
      .subscribe((response:any)=>{
        location.href = response.redirect_url;
      },(error)=>{
        console.log(error);
      });    
    }
  }

  logOut(provider: string)
  {
    const endpoint = API.main.oauthRevoke.replaceAll('{{provider}}',provider)
    this.restService.getAll(endpoint)
      .subscribe((response:any)=>{
        delete this.profiles[provider]
      },(error)=>{
        console.log(error);
      });  
  }
}
