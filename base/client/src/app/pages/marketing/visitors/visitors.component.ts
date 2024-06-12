import { Component,OnInit, AfterViewInit, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { PlatformService } from 'src/app/shared/services/platform.service';
import { ActivatedRoute,Router  } from '@angular/router';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ScrollUtilService } from 'src/app/shared/services/scroll-util.service';

@Component({
  selector: 'app-visitors',
  templateUrl: './visitors.component.html',
  styleUrls: ['./visitors.component.scss']
})
export class VisitorsComponent implements OnInit, AfterViewInit
{
  botId:any = undefined;
  visitersList:any = [];
  currentPage:number = 1;
  itemPerPage:number = 25;
  totalItems:number = 0;

  selectedVisitor: any | null = null;
  isVisitorLoading:boolean = false;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('infoJsonCellTemplate') infoJsonCellTemplate!: TemplateRef<any>;


  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private restService:RestService,
    private platformService: PlatformService,
    private notifService:NotificationService,
    private scrollService: ScrollUtilService
  ){

  }

  ngOnInit(): void 
  {
    this.getVisitors();
    const visitorId = this.router.snapshot.params['id'];
    if(visitorId)
    {
      this.getSelectedVisitor(visitorId);
    }
  }
  ngAfterViewInit(): void {
    const containerElement = this.scrollContainer.nativeElement;
    
  }

  getVisitors()
  {
    const pagination = { page: this.currentPage, limit: this.itemPerPage };
    let queryParams:any = { ...this.router.snapshot.queryParams, ...pagination };
    queryParams = this.objectToQueryString(queryParams);
    const endpoint = API.main.visitor + `?${queryParams}`;
    this.restService.getAll(endpoint)
    .subscribe((response:any)=>{
      if (this.visitersList.data) {
        const newData = response.data.filter((item: any) => !this.visitersList.data.some((existingItem: any) => existingItem.id === item.id));
        this.visitersList.data = this.visitersList.data.concat(newData);
        this.visitersList.total = response.total;
        this.visitersList.page = response.page;
      }
      else {
        this.visitersList = response;
      }
      this.totalItems = response.total;
    },(error)=>{
      console.log(error);
      this.notifService.showError(error.error.message);
    });
  }

  selectVisitor(visitor: any) {
    if (visitor) {
      const queryParams = this.router.snapshot.queryParams;
      this.route.navigate(['/visitors', visitor.id],{ queryParams: queryParams });
      this.getSelectedVisitor(visitor?.id);
    }
  }

  getSelectedVisitor(id: string) {
    if(!id || id == 'all') {
      return;
    }
    this.isVisitorLoading = true;
    this.restService.get(API.main.visitor, id)
    .subscribe((response: any) => {
      this.selectedVisitor = response;
      this.isVisitorLoading = false;
    }, (error) => {
        this.isVisitorLoading = false;
        this.notifService.showError(error.error.message);
      });
  }

  jsonParse(text: string)
  {
    return JSON.parse(text);
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

  sumOfCounts(listOfObj: any) {
    let sum = 0;
    for (let i = 0; i < listOfObj.length; i++) {
      if (typeof listOfObj[i].count === 'number') {
        sum += listOfObj[i].count;
      }
    }
    return sum;
  }

  onPageChange(event:any){
    this.currentPage = event.page;
    this.getVisitors();
  }

}
