import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { error } from 'console';
import { response } from 'express';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-accountview',
  templateUrl: './accountview.component.html',
  styleUrl: './accountview.component.scss'
})
export class AccountviewComponent {

  userImageUrl = 'https://imgs.search.brave.com/jzDlpQmvTCnP6fEt-6Vqfc3cMmLQ_H6gFRWXDW02xWo/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90ZW1w/bGF0ZS5jYW52YS5j/b20vRUFFRkg5V0k0/YWMvMS8wLzQwMHct/RjRRQm1Bc2JpUjQu/anBn';
  userName = 'Erica Goodig'; 
  
  userLinkedIn = 'https://www.linkedin.com/in/e.gooding';
  
  active = 1; 



  userId: string="";
  userData: any;
  selectedData: any;
  constructor(
    private route: ActivatedRoute,
    private restService: RestService,
    private notifService: NotificationService,

  
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')??'';
    this.fetchUserData(this.userId);
    
  }

fetchUserData(id:string){
this.restService.get(API.main.account,id).subscribe(
  (response:any)=>{
    this.selectedData=response.data;
    console.log("fetchedData",this.selectedData)
  },
  (error)=>{
    console.log(error)
    this.notifService.showError(error.error.message);
  }
)
}

}
