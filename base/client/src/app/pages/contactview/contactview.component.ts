import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';

@Component({
  selector: 'app-contactview',
  templateUrl: './contactview.component.html',
  styleUrl: './contactview.component.scss'
})
export class ContactviewComponent {
  userImageUrl = 'assets/user-image.jpg';
  userName = 'Unknown image'; 
  
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
this.restService.get(API.main.contact,id).subscribe(
  (response:any)=>{
    this.selectedData=response.data;
    console.log("fetchedData",this.selectedData)
  },
  (error:any)=>{
    console.log(error)
    this.notifService.showError(error.error.message);
  }
)
}
}
