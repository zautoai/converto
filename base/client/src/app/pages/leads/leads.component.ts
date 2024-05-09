import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatformService } from 'src/app/shared/services/platform.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ScrollUtilService } from 'src/app/shared/services/scroll-util.service';
import { updateDataList } from 'src/app/common/utils';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss']
})

export class leadscomponent implements OnInit,AfterViewInit {
  constructor(
    private restService: RestService,
    private router: ActivatedRoute,
    private route: Router,
    private avatarService: AvatarService,
    private platformService: PlatformService,
    private notifService:NotificationService,
    private scrollService: ScrollUtilService
  ) { }

  selectedLead: any = undefined;
  leadList: any = [];
  isLeadLoading:boolean = false;

  // live scroll
  currentPage: number = 1;
  itemPerPage: number = 25;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  ngOnInit(): void {
    this.getLeads()
  }

  ngAfterViewInit(): void {
    const containerElement = this.scrollContainer.nativeElement;
    
    this.scrollService.containerReachedBottom(containerElement)
    .subscribe({
      next:(reachedBottom)=>{
        if(reachedBottom)
        {
          this.onListScrolledBottom();
        }
      }
    });
    this.scrollService.containerReachedTop(containerElement)
    .subscribe({
      next:(reachedTop)=>{
        if(reachedTop)
        {
        }
      }
    });
    
  }


  getLeads() {
    const pagination = { page: this.currentPage, limit: this.itemPerPage };
    let queryParams:any = { ...this.router.snapshot.queryParams, ...pagination };
    queryParams = this.objectToQueryString(queryParams);
    const endpoint = API.main.lead + `?${queryParams}`;
    this.restService.getAll(endpoint)
      .subscribe((response: any) => {
        this.leadList = updateDataList(response, this.leadList, null);
        const leadId = this.router.snapshot.params['id'];
        if(leadId)
        {
          this.getSelectedLead(leadId);
        }
      }, (error) => {
        console.log(error);
        this.notifService.showError(error.error.message);
      });
  }


  selectLead(lead: any) {
    if (lead) {
      const queryParams = this.router.snapshot.queryParams;
      this.route.navigate(['/leads', lead.id],{ queryParams: queryParams });
      this.getSelectedLead(lead?.id);
    }
  }

  getSelectedLead(id: string) {
    this.isLeadLoading = true;
    this.restService.get(API.main.lead, id)
    .subscribe((response: any) => {
      this.selectedLead = response;
      this.isLeadLoading = false;
    }, (error) => {
        this.isLeadLoading = false;
        console.log(error);
        this.notifService.showError(error.error.message);
      });
  }

  jsonParse(text: string)
  {
    return JSON.parse(text);
  }

  onListScrolledBottom() {
    const totalCount = this.leadList?.total;
    const itemPerPage = this.itemPerPage;

    if (totalCount && itemPerPage) {
      const maxPage = Math.ceil(totalCount / itemPerPage);
      if (this.currentPage < maxPage) {
        this.currentPage++;
        this.getLeads();
      }
    } else {
      console.error('Total count or items per page not available');
    }
  }

  objectToQueryString(obj: { [key: string]: any }): string {
    const queryString = Object.keys(obj)
      .map(key => {
        const value = obj[key];
        if (value !== null && value !== undefined) {
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }
        return '';
      })
      .filter(Boolean)
      .join('&');

    return queryString;
  }
  getPlatformIcon(name: string) {
    let platform = this.platformService.defaultPlatforms.find(platform => platform.name === name);
    if (!platform) {
      platform = this.platformService.otherPlatform;
    }
    return platform;
  }

}


