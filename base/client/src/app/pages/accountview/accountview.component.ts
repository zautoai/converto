import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
 
calltoaction() {
  this.router.navigate(['../accounts']);
}

  userImageUrl = 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600';
  userName = 'Erica Goodig'; 
  
  userLinkedIn = 'https://www.linkedin.com/in/e.gooding';
  
  active = 1; 



  userId: string="";
  userData: any;
  
  leadscore:any=100;
  selectedData: any;
  constructor(
    private route: ActivatedRoute,
    private restService: RestService,
    private notifService: NotificationService,
    private router: Router
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
