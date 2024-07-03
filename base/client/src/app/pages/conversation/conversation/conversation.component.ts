import { Component, OnInit, ViewChild, Renderer2, ElementRef, AfterViewInit } from '@angular/core';
import { RestService } from 'src/app/shared/services/rest.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Conversationservice } from 'src/app/shared/services/conversation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { API } from 'src/app/config/endpoint.config';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { WebsocketService, SocketEventEnum } from 'src/app/shared/services/websocket.service';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/shared/services/platform.service';
import { Vote } from 'src/app/widgets/chat-bot-widgets/chatbot/chat-bot-widgets.component';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';
import { SummaryContainerComponent } from '../summary-container/summary-container.component';
import { ChatContainerComponent } from '../chat-container/chat-container.component';
import { ScrollUtilService } from 'src/app/shared/services/scroll-util.service';
import { updateDataList } from 'src/app/common/utils';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class conversationcomponent implements OnInit, AfterViewInit {

  GLOBAL_IMAGES = GLOBAL_IMAGES;
  campaigns = [];
  selectedCampaign: any = null;
  selectedDates: any = null;
  onlineOnly: boolean = false;
  leadOnly: boolean = false;
  selectedFiltersList: any = [];

  agentId: any = undefined;
  selectedConvo: any = null;
  convList: any = [];
  searchInput = "";
  vote = Vote;
  // live scroll
  currentPage: number = 1;
  itemPerPage: number = 25;

  newConversation:any = null;

  // socket events
  private convStatusEvent!: Subscription;
  private newConvEvent!: Subscription;

  //connection
  connectionInprogress: boolean = false;

  @ViewChild('filterOffcanvas') filterOffcanvas: ElementRef | any;
  @ViewChild('chatBody', { static: false }) chatBodyRef!: ElementRef;
  @ViewChild(SummaryContainerComponent) summaryContainerComponent!: SummaryContainerComponent;
  @ViewChild(ChatContainerComponent) chatContainerComponent!: ChatContainerComponent;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  showSummary: boolean = true;
  closedSummarys: any[] = [];

  constructor(
    public conversationService: Conversationservice,
    private renderer: Renderer2,
    private restService: RestService,
    private route: ActivatedRoute,
    private router: Router,
    private offcanvasService: NgbOffcanvas,
    private socketService: WebsocketService,
    private platformService: PlatformService,
    public modalService: NgbModal,
    public alertService: SweetAlertService,
    private scrollService: ScrollUtilService
  ) { }

  ngOnInit() {

    this.getAllCampaigns();
    this.getConversations();
    this.registerEvents();
  }
  ngAfterViewInit(): void {

    const convId = this.route.snapshot.params['id'];
    if (convId) {
      if (this.chatContainerComponent) {
        this.chatContainerComponent.getSelectedConvo(convId);
      }
      if (this.summaryContainerComponent) {
        this.summaryContainerComponent.getSummary(convId);
      }
    }

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

  registerEvents() {
    // conversation status
    if (this.convStatusEvent) this.convStatusEvent.unsubscribe();
    this.convStatusEvent = this.socketService.registerCustomEvent("convStatusUpdate", SocketEventEnum.CONVSTATUS)
      .subscribe((data: any) => {
        if (data.event == SocketEventEnum.CONVSTATUS) {
          const index = this.convList.data.findIndex((obj: any) => obj.id === data?.convId);
          this.convList.data[index].status = data?.status;
        }
      });

    // new conversation
    if (this.newConvEvent) this.newConvEvent.unsubscribe();
    this.newConvEvent = this.socketService.registerCustomEvent("newConversation", SocketEventEnum.NEWCONVERSATION)
      .subscribe((data: any) => {
        if (data.event == SocketEventEnum.NEWCONVERSATION) {
          this.newConversation = data;
          if(this.newConversation)
          {
            this.getConversations();
          }       
        }
      });
  }

  getAllCampaigns() {
    this.restService.getAll(API.main.campaign)
      .subscribe((response: any) => {
        this.campaigns = response?.data;
        this.route.queryParams.subscribe(params => {
          this.extractFiltersFromQueryParams(params);
        });
      }, (error) => {
        console.log(error);
      });
  }

  getConversations() {
    let queryParams: any = null;
    setTimeout(() => {
      const pagination = { page: this.currentPage, limit: this.itemPerPage };
      queryParams = { ...this.route.snapshot.queryParams, ...pagination };
      delete queryParams.convId;
      queryParams = this.objectToQueryString(queryParams);

      const endpoint = API.main.conversation + `?${queryParams}`;
      this.restService.getAll(endpoint)
        .subscribe((response: any) => {
          this.convList = updateDataList(response, this.convList, this.newConversation);          
        }, (error) => {
          console.log(error);
        });
    }, 0);
  }


  getConvoById(id: string) {
    const convo = this.convList.data.find((convo: any) => convo.id === id);
    return convo;
  }


  selectConvo(conversation: any) {

    this.selectedConvo = conversation;
    console.log(this.selectedConvo);
    
    const queryParams = this.route.snapshot.queryParams;
    this.router.navigate(['/conversations', conversation.id], { queryParams: queryParams });

    if (this.chatContainerComponent) {
      this.chatContainerComponent.getSelectedConvo(conversation?.id);
    }

    if (this.summaryContainerComponent) {
      this.summaryContainerComponent.getSummary(conversation?.id);
    }
  }

  onGetConversation(convoData: any) {
    if (convoData) {
      this.selectedConvo = convoData;
      if (this.summaryContainerComponent) {
        this.summaryContainerComponent.data = convoData;
      }
    }

  }

  get filteredData(): any[] {
    if (this.searchInput) {
      const searchQuery = this.searchInput.toLowerCase();
      return this.convList.filter((d: any) => d.username.toLowerCase().includes(searchQuery));
    }
    return this.convList;
  }

  openFilterCanvas() {
    this.offcanvasService.open(this.filterOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  onFilterChange(event: any) {
    this.selectedCampaign = event;
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

  onFilterDateChange(event: any) {
    this.selectedDates = event ? event : { fromDate: null, toDate: null };
  }

  applyFilter() {
    const queryParams: any = {};

    if (this.selectedCampaign) {
      queryParams.campaign = this.selectedCampaign.id;
    }

    if (this.selectedDates?.fromDate || this.selectedDates?.toDate) {
      queryParams.fromDate = this.selectedDates?.fromDate;
      queryParams.toDate = this.selectedDates?.toDate || this.selectedDates?.fromDate;
    }

    if (this.onlineOnly) {
      queryParams.status = this.onlineOnly ? "online" : "";
    }
    if (this.leadOnly) {
      queryParams.lead = this.leadOnly;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
    this.currentPage = 1;
    this.convList = {};
    this.updateSelectedFiltersList();
    this.getConversations();
    this.offcanvasService.dismiss();
  }

  extractFiltersFromQueryParams(params: any) {
    const { campaign, fromDate, toDate, status, lead } = params;

    if (campaign) {
      const selectedCampaign = this.campaigns.find((c: any) => c.id === campaign);
      if (selectedCampaign) {
        this.selectedCampaign = selectedCampaign;
      }
    }

    if (fromDate || toDate) {
      this.selectedDates = { fromDate, toDate };
    }

    this.onlineOnly = status === "online" ? true : false;
    this.leadOnly = lead;

    this.updateSelectedFiltersList();
  }

  updateSelectedFiltersList() {
    this.selectedFiltersList = [];

    if (this.selectedCampaign) {
      this.selectedFiltersList.push({ type: 'Campaign', value: this.selectedCampaign });
    }

    if (this.selectedDates?.fromDate || this.selectedDates?.toDate) {
      this.selectedFiltersList.push({
        type: 'Date Range',
        value: this.selectedDates,
      });
    }

    if (this.onlineOnly) {
      this.selectedFiltersList.push({
        type: 'Status',
        value: this.onlineOnly ? "Online only" : "Offline only",
      });
    }

    if (this.leadOnly) {
      this.selectedFiltersList.push({
        type: 'Lead',
        value: this.leadOnly ? "Lead only" : "No lead",
      });
    }
  }

  removeFilter(filterType: string) {
    if (filterType === 'Campaign') {
      this.selectedCampaign = null;
    } else if (filterType === 'Date Range') {
      this.selectedDates = { fromDate: null, toDate: null };
    }
    else if (filterType === "Status") {
      this.onlineOnly = false;
    }
    else if (filterType === "Lead") {
      this.leadOnly = false;
    }
    this.updateSelectedFiltersList();
    this.applyFilter();
  }

  jsonParser(jsonString: string) {
    const object = JSON.parse(jsonString);
    return object;
  }

  getPlatformIcon(name: string) {
    let platform = this.platformService.defaultPlatforms.find(platform => platform.name === name);
    if (!platform) {
      platform = this.platformService.otherPlatform;
    }
    return platform;
  }

  onListScrolledBottom() {
    const totalCount = this.convList?.total;
    const itemPerPage = this.itemPerPage;
    
    if (totalCount && itemPerPage) {
      const maxPage = Math.ceil(totalCount / itemPerPage);
      if (this.currentPage < maxPage) {
        this.currentPage++;
        this.getConversations();
      }
    } else {
      console.error('Total count or items per page not available');
    }
  }

  toggleSummary() {
    this.showSummary = !this.showSummary;
  }
}

