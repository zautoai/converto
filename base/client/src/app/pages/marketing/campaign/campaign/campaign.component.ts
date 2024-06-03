import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { AdvanceOffcanvasComponent } from 'src/app/components/advance-offcanvas/advance-offcanvas.component';
import { markFormGroupAsDirty } from 'src/app/components/advanced-inputs/input.util';
import { AdvancedModalsComponent } from 'src/app/components/advanced-modals/advanced-modals/advanced-modals.component';

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
  campaignForm:FormGroup = new FormGroup({
    title: new FormControl("",[Validators.required]),
    description: new FormControl(""),
    url: new FormControl("",[Validators.pattern('^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$')]),
    startDate: new FormControl(""),
    endDate: new FormControl(""),
    isOthers: new FormControl(false),
    idParam: new FormControl(""),
    idValue: new FormControl(""),
    isabm:new FormControl(false),
    accountId: new FormControl(null),
  });
  errorMessages = {
    title: {
      required: 'Title is required',
    },
    url: {
      pattern: 'URL is invalid'
    },
  };
  
  selectedCampaign: any;
  Accounts: any;
  selectedCampaignStats: any;
  selectedCampaignaccounts:any;

  campaignList: any = [];
  platforms: any = [];
  linkList: link[] = [];
  customLinkList: link[] = [];
  isLoading:boolean = false;
  isEdit: boolean = false;
  
  searchTerm: string = '';
  private searchSubject: Subject<string> = new Subject<string>();

  // live scroll
  currentPage: number = 1;
  itemPerPage: number = 25;

  @ViewChild(AdvanceOffcanvasComponent) advanceOffcanvasComponent!: AdvanceOffcanvasComponent;
  @ViewChild(AdvancedModalsComponent) deleteCampaignModal!: AdvancedModalsComponent;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private modalService: NgbModal,
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

    this.searchSubject.pipe(debounceTime(1000)).subscribe((term) => {
      this.currentPage = 1;
      this.campaignList = {};
      this.searchTerm = term;
      this.selectedCampaign = null;
      this.getCampaigns();
    });
  }

  get title() {
    return this.campaignForm.get('title') as FormControl;
  }

  get description() {
    return this.campaignForm.get('description') as FormControl;
  }

  get url() {
    return this.campaignForm.get('url') as FormControl;
  }

  get isOthers(){
    return this.campaignForm.get('isOthers') as FormControl;
  }

  get idParam(){
    return this.campaignForm.get('idParam') as FormControl;
  }

  get idValue(){
    return this.campaignForm.get('idValue') as FormControl;
  }

  get startDate() {
    return this.campaignForm.get('startDate') as FormControl;
  }

  get endDate() {
    return this.campaignForm.get('endDate') as FormControl;
  }

  get status() {
    return this.campaignForm.get('status') as FormControl;
  }

  get isabm() {
    return this.campaignForm.get('isabm') as FormControl;
  }

  get accountId() {
    return this.campaignForm.get('accountId') as FormControl;
  }

  ngOnInit(): void {
    this.getPlatforms();
    this.getContacts();
    this.getCampaigns();
    const isabmControl = this.campaignForm.get('isabm');
    if (isabmControl !== null && isabmControl !== undefined && isabmControl.valueChanges) {
      isabmControl.valueChanges.subscribe(isabm=>{
        if(isabm){

        }
      })
    }
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
  getCampaignaccount(id: string) {
    this.restService.get(API.main.abm, id )
      .subscribe((response: any) => {
        this.selectedCampaignaccounts = response;
        console.log("responsegetcampaign",response);
        console.log("accoundetails",this.selectedCampaignaccounts.data.
        accountName
      )              
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
    this.getCampaignaccount(campaign.accountId) 
  }

  getSelectedCampaign(id: string) {
    this.selectedCampaign = null;
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
    this.isEdit = false;
    this.campaignForm.reset();
    this.advanceOffcanvasComponent.open();
  }

  openEditCampaign() {
    this.isEdit = true;
    this.campaignForm.reset();
    this.campaignForm.patchValue(this.selectedCampaign);
    this.isabm?.setValue((this.accountId.value ? true : false));
    this.isOthers?.setValue((this.idParam.value ? true : false));
    this.advanceOffcanvasComponent.open();
  }

  openDeleteCampaign(entity:any) {
    this.deleteCampaignModal.open(entity);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmit() {    

    if (this.campaignForm.valid) {
      const data = this.campaignForm.value;
      console.log(data);
      
      this.isLoading = true;
      if(this.isEdit)
      {
        this.restService.patch(API.main.campaign, this.selectedCampaign.id, data)
          .subscribe((response: any) => {
            this.getCampaigns();
            this.campaignForm.reset();
            this.offcanvasService.dismiss();
            this.notifService.showSuccess("Campaign updated.");
            this.selectedCampaign = response;
            this.generateLinks();
            this.isLoading = false;
          }, (error) => {
            this.isLoading = false;
            console.log(error);
          });
      }
      else
      {
        this.restService.post(API.main.campaign, data)
          .subscribe((response: any) => {
            this.getCampaigns();
            this.campaignForm.reset();
            this.offcanvasService.dismiss();
            this.notifService.showSuccess("New campaign created.");

            this.isLoading = false;
          }, (error) => {
            this.notifService.showError(error.error.message);
            console.log(error);
            this.isLoading = false;
          });
      }
    }
    else {
      markFormGroupAsDirty(this.campaignForm);
      this.isLoading = false;
    }
  }

  onDeleteCampaignSubmit(entity:any) {
    if (entity && !entity.isDefault) {
      this.restService.delete(API.main.campaign, entity.id)
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

  getContacts(): void {

    this.restService
      .getAll(API.main.abm) // Fetch all contacts from the API
      .subscribe(
        (response: any) => {
          this.Accounts = response.data; // Assign contacts from response to your contacts array
          console.log(this.Accounts)
        },
        (error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
        }
      );
  }
  

}
