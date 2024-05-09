import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { PlatformService } from 'src/app/shared/services/platform.service';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { ScrollUtilService } from 'src/app/shared/services/scroll-util.service';
import { updateDataList } from 'src/app/common/utils';

interface link {
  name: string;
  url: string;
}

@Component({
  selector: 'app-campaign',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.scss']
})
export class CampaignComponent implements OnInit,AfterViewInit {

  // agentId:any = undefined;
  campaignForm: FormGroup;
  errorFeedback: any = { title: "", desc: "", url: "",key:"",value:"" };
  selectedCampaign: any;
  selectedCampaignStats: any;
  campaignList: any = [];
  platforms: any = [];
  linkList: link[] = [];
  customLinkList: link[] = [];
  isOn: boolean = false;

  searchTerm: string = '';
  private searchSubject: Subject<string> = new Subject<string>();

  // live scroll
  currentPage: number = 1;
  itemPerPage: number = 25;

  @ViewChild('createCampaignOffcanvas') createCampaignModal: ElementRef | any;
  @ViewChild('editCampaignOffcanvas') editCampaignModal: ElementRef | any;
  @ViewChild('deleteCampaignModal') deleteCampaignModal: ElementRef | any;
  @ViewChild('filterOffcanvas') filterOffcanvas: ElementRef | any;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;


  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private restService: RestService,
    private avatarService: AvatarService,
    private notifService: NotificationService,
    private platformService: PlatformService,
    private offcanvasService: NgbOffcanvas,
    private route: ActivatedRoute,
    private router: Router,
    private sweetAlertService: SweetAlertService,
    private scrollService: ScrollUtilService
  ) {
    this.campaignForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      url: [''],
      startDate: [''],
      endDate: [''],
      status: [''],
      isOthers: [false],
      idParam: [''],
      idValue: [''],
    });

    this.searchSubject.pipe(debounceTime(1000)).subscribe((term) => {
      this.currentPage = 1;
      this.campaignList = {};
      this.searchTerm = term;
      this.selectedCampaign = null;
      this.getCampaigns();
    });
  }

  ngOnInit(): void {
    this.getPlatforms();
    this.getCampaigns();

  }

  ngAfterViewInit(): void {
    const containerElement = this.scrollContainer.nativeElement;

    this.scrollService.containerReachedBottom(containerElement)
    .subscribe({
      next:(reachedBottom)=>{
        if(reachedBottom)
        {
          this.onScrolledBottom();
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

  getCampaigns() {
    let queryParams: any = null;
    const searchQ = { searchQ: this.searchTerm.trim().toLowerCase() };
    const pagination = { page: this.currentPage, limit: this.itemPerPage };
    queryParams = { ...this.route.snapshot.queryParams, ...pagination, ...searchQ };
    queryParams = this.objectToQueryString(queryParams);
    let endpoint = API.main.campaign + `?${queryParams}`;

    this.restService.getAll(endpoint)
      .subscribe((response: any) => {
        this.campaignList = updateDataList(response, this.campaignList, null);
        const campaignId = this.route.snapshot?.queryParams['campaignId'];
        this.selectCampaign(this.getCampaignById(campaignId));
      }, (error) => {
        console.log(error);
      });
  }

  getCampaignStats(id: string) {
    this.restService.get(API.main.campaign, id + "/stats")
      .subscribe((response: any) => {
        this.selectedCampaignStats = response;
        console.log(response);              
      }, (error) => {
        console.log(error);
        this.notifService.showError(error.error.message);
      });
  }

  getPlatforms() {

    this.restService.getAll(API.main.orgPlatform)
      .subscribe((response: any) => {
        this.platforms = response.data;
        const campaignId = this.route.snapshot.params['id'];
        if (campaignId){ 
          this.getSelectedCampaign(campaignId)
          this.getCampaignStats(campaignId);
        };
      }, (error) => {
        console.log(error);
      });
  }

  selectCampaign(campaign: any) {
    const queryParams = this.route.snapshot.queryParams;
    this.router.navigate(['/campaigns', campaign.id], { queryParams: queryParams });
    this.getSelectedCampaign(campaign.id);
    this.getCampaignStats(campaign.id);
  }

  getSelectedCampaign(id: string) {
    this.restService.get(API.main.campaign, id)
      .subscribe((response: any) => {
        this.selectedCampaign = response;
        this.generateLinks();
      }, (error) => {
        console.log(error);
        this.notifService.showError(error.error.message);
      });
  }

  openCreateCampaign() {
    this.campaignForm.reset();
    this.resetErrorFeedback();
    this.offcanvasService.open(this.createCampaignModal, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  openEditCampaign() {
    this.resetErrorFeedback();
    this.campaignForm.reset();
    if (this.selectedCampaign) {
      this.campaignForm.get('title')?.setValue(this.selectedCampaign.title);
      this.campaignForm.get('description')?.setValue(this.selectedCampaign.description);
      this.campaignForm.get('url')?.setValue(this.selectedCampaign.url);
      this.campaignForm.get('startDate')?.setValue(this.formatDate(this.selectedCampaign.startDate));
      this.campaignForm.get('endDate')?.setValue(this.formatDate(this.selectedCampaign.endDate));
      this.campaignForm.get('status')?.setValue(this.selectedCampaign.status);
      this.campaignForm.get('isOthers')?.setValue(!this.selectedCampaign.isZauto);
      this.campaignForm.get('idParam')?.setValue(this.selectedCampaign.idParam);
      this.campaignForm.get('idValue')?.setValue(this.selectedCampaign.idValue);
    }
    this.offcanvasService.open(this.editCampaignModal, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  openDeleteCampaign() {
    // this.modalService.open(this.deleteCampaignModal, { size: 'md', centered: true });
    this.sweetAlertService.warning("Delete campaign","Are you sure you want to delete ?",['Delete','Cancel'],(confirm:any)=>{
      if(confirm.isConfirmed)
      {
        this.onDeleteCampaignSubmit();
      }
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onCreateCampaignSubmit() {
    this.resetErrorFeedback();
    const title: string = this.campaignForm.value.title || "";
    const desc: string = this.campaignForm.value.description || "";
    const url: string = this.campaignForm.value.url || "";
    const isZauto: boolean = !this.campaignForm.value.isOthers || false;
    const idParam: string = this.campaignForm.value.idParam || "";
    const idValue: string = this.campaignForm.value.idValue || "";

    if (this.campaignForm.valid) {
      const data = {
        agentId: this.avatarService.getAvatarId(),
        title: title,
        description: desc,
        url: url,
        isZauto: isZauto,
        idParam: idParam,
        idValue: idValue
      };
      this.restService.post(API.main.campaign, data)
        .subscribe((response: any) => {
          this.getCampaigns();
          this.campaignForm.reset();
          this.offcanvasService.dismiss();
          this.notifService.showSuccess("New campaign created.");
        }, (error) => {
          this.notifService.showError(error.error.message);
          console.log(error);
        });
    }
    else {
      if (title.length <= 0) {
        this.errorFeedback.title = "Title required.";
      }
      if (desc.length <= 0) {
        this.errorFeedback.desc = "Description required.";
      }
      if(!isZauto)
      {
        if (idParam.length <= 0) {
          this.errorFeedback.key = "Key required.";
        }
        if (idValue.length <= 0) {
          this.errorFeedback.value = "Key required.";
        }
      }
    }
  }

  onEditCampaignSubmit() {
    this.resetErrorFeedback();
    const title: string = this.campaignForm.value.title || "";
    const desc: string = this.campaignForm.value.description || "";
    const url: string = this.campaignForm.value.url || "";
    const startDate: string = this.campaignForm.value.startDate || "";
    const endDate: string = this.campaignForm.value.endDate || "";
    // const status: string = this.campaignForm.value.status || "";
    const isZauto: boolean = !this.campaignForm.value.isOthers || false;
    const idParam: string = this.campaignForm.value.idParam || "";
    const idValue: string = this.campaignForm.value.idValue || "";

    if (this.campaignForm.valid) {
      const data: any = {
        title: title,
        description: desc,
        url: url,
        // status: status,
        isZauto: isZauto,
        idParam: idParam,
        idValue: idValue
      };

      if (startDate) data['startDateTimestamp'] = new Date(startDate).getTime();
      if (endDate) data['endDateTimestamp'] = new Date(endDate).getTime();


      if (this.selectedCampaign) {
        this.restService.patch(API.main.campaign, this.selectedCampaign.id, data)
          .subscribe((response: any) => {
            this.getCampaigns();
            this.campaignForm.reset();
            this.offcanvasService.dismiss();
            this.notifService.showSuccess("Campaign updated.");
            this.selectedCampaign = response;
            this.generateLinks();
          }, (error) => {
            console.log(error);
          });
      }
    }
    else {
      if (title.length <= 0) {
        this.errorFeedback.title = "Title required.";
      }
      if (desc.length <= 0) {
        this.errorFeedback.desc = "Description required.";
      }
      if(!isZauto)
      {
        if (idParam.length <= 0) {
          this.errorFeedback.key = "Key required.";
        }
        if (idValue.length <= 0) {
          this.errorFeedback.value = "Key required.";
        }
      }
    }
  }

  onDeleteCampaignSubmit() {
    if (this.selectedCampaign && !this.selectedCampaign.isDefault) {
      this.restService.delete(API.main.campaign, this.selectedCampaign.id)
        .subscribe((response: any) => {
          this.closeModal();
          this.getCampaigns();
          this.selectedCampaign = null;
          this.router.navigate(['/campaigns']);
          this.notifService.showSuccess("Campaign deleted.");
        }, (error) => {
          console.log(error);
        });

    }
  }

  getCampaignById(id: string) {
    const campaign = this.campaignList.data.find((campaign: any) => campaign.id === id);
    return campaign;
  }


  toggleStatus() {
    if (this.selectedCampaign) {
      let newStatus: string;

      if (this.selectedCampaign.status === 'ACTIVE') {
        newStatus = 'INACTIVE';
      } else if (this.selectedCampaign.status === 'INACTIVE') {
        newStatus = 'ACTIVE';
      } else {
        return;
      }

      const data = { status: newStatus };
      this.restService.patch(API.main.campaign, this.selectedCampaign.id, data)
        .subscribe((response: any) => {
          this.getCampaigns();
          this.campaignForm.reset();
          this.closeModal();
          this.selectedCampaign = response;
        }, (error) => {
          console.log(error);
        });
    }
  }


  generateLinks() {
    if (this.platforms.length > 0 && this.selectedCampaign) {
      this.customLinkList.splice(0, this.customLinkList.length);
      this.linkList.splice(0, this.linkList.length);

      this.platforms.forEach((orgPlatform: any) => {
        const platformName = orgPlatform.platform.name;
        let url = API.platformUrl;
        url = url.replace('{{agentId}}', this.avatarService.getAvatarId()!)
          .replace('{{selectedCampaign}}', this.selectedCampaign.id);

        const link: link = { name: platformName, url: url };
        this.linkList.push(link);

        let customUrl = this.selectedCampaign.url + "?campaign={{selectedCampaign}}";
        customUrl = customUrl.replace('{{platformName}}', platformName)
          .replace('{{selectedCampaign}}', this.selectedCampaign.id);
        const customLink: link = { name: platformName, url: customUrl };
        this.customLinkList.push(customLink);
      });
    }
  }

  getPlatformIcon(name: string) {
    let platform = this.platformService.defaultPlatforms.find(platform => platform.name === name);
    if (!platform) {
      platform = this.platformService.otherPlatform;
    }
    return platform;
  }

  isFieldValid(fieldName: string): boolean {
    const control = this.campaignForm.get(fieldName)!;
    return control.invalid && control.dirty;
  }

  resetErrorFeedback() {
    let keys = Object.keys(this.errorFeedback);
    for (let key of keys) {
      this.errorFeedback[key] = "";

    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  onSearchTermChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const term = inputElement.value;
    this.searchSubject.next(term);
  }

  onScrolledBottom() {
    const totalCount = this.campaignList?.total;
    const itemPerPage = this.itemPerPage;

    if (totalCount && itemPerPage) {
      const maxPage = Math.ceil(totalCount / itemPerPage);
      if (this.currentPage < maxPage) {
        this.currentPage++;
        this.getCampaigns();
      }
    } else {
      console.error('Total count or items per page not available');
    }
  }

  // filter
  openFilterCanvas() {
    this.offcanvasService.open(this.filterOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
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

}
