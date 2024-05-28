import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';

@Component({
  selector: 'app-icp',
  templateUrl: './icp.component.html',
  styleUrl: './icp.component.scss'
})
export class IcpComponent {

  icpdata: any = []


  constructor(
    private restService: RestService,
    private notifService: NotificationService,
    private sweetAlertService: SweetAlertService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.getIcps();
  }

  getIcps(): void {
    this.restService.getAll(API.main.icp).subscribe({
      next: (response: any) => {
        this.icpdata = response.data;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  handleCreate(): void {
    this.router.navigate(['/icp/create']);
  }
}
