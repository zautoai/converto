import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { ScrollUtilService } from 'src/app/shared/services/scroll-util.service';
import { updateDataList } from 'src/app/common/utils';


@Component({
  selector: 'app-sites',
  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.scss']
})
export class SitesComponent implements OnInit, AfterViewInit{

  rootUrl: string = "";
  isLoading: boolean = false;
  links: string[] = [];
  selectedLinks: string[] = [];
  selectedLink: any;
  agentId: any;
  isTraing: boolean = false;
  trainedLinks: any = [];

  selectedSite: any = null;

  currentPage: number = 1;
  itemPerPage: number = 25;

  isGeneratingGreetings: boolean = false;
  generatedGreetings:any = [];

  selectedGreetings: any = [];

  @ViewChild('siteListModal') siteListModal: ElementRef | any;
  @ViewChild('generateGreetingOffcanvas') generateGreetingOffcanvas: ElementRef | any;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private route: Router,
    private restService: RestService,
    private avatarService: AvatarService,
    public modalService: NgbModal,
    private notifService: NotificationService,
    private router: ActivatedRoute,
    private offcanvasService: NgbOffcanvas,
    private sweetAlertService: SweetAlertService,
    private scrollService: ScrollUtilService
  ) { }

  ngOnInit(): void {
    this.agentId = this.avatarService.getAvatarId();

    this.getTrainedLinks();
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

  fetchUrls() {
    if (this.rootUrl.length !== 0) {
      this.selectedLinks = [];
      this.isLoading = true;
      this.restService.post(API.main.site + '/links', { rootUrl: this.rootUrl })
        .subscribe((response: any) => {
          this.isLoading = false;
          const links = response.links;
          if (links) {
            this.links = links;
            this.offcanvasService.open(this.siteListModal, {
              position: 'end',
              backdrop: 'static',
              panelClass: 'visible',
              animation: true,
            });
          }

        }, (error) => {
          this.isLoading = false;
          console.log(error);
        });
    }
  }

  isLinkSelected(link: string) {
    return this.selectedLinks.includes(link);
  }

  selectAllLinks() {
    if (this.selectedLinks.length === 0) {
      this.selectedLinks = [...this.links];
    }
    else {
      this.selectedLinks = [];
    }
  }

  addToSelect(index: number) {
    const link = this.links[index];
    if (this.selectedLinks.includes(link)) {
      const indexToDelete = this.selectedLinks.indexOf(link);
      this.selectedLinks.splice(indexToDelete, 1);
    }
    else {
      this.selectedLinks.push(link);
    }
  }

  trainAgent() {
    if (this.selectedLinks.length > 0 && this.agentId) {

      this.isTraing = true;
      this.restService.post(API.main.site + '/process', { urls: this.selectedLinks, agentId: this.agentId })
        .subscribe((response: any) => {

          this.isTraing = false;
          this.notifService.showSuccess("Traing started.");
          this.offcanvasService.dismiss();
          this.rootUrl = "";
          this.getTrainedLinks();
        }, (error) => {
          console.log(error);
          this.isTraing = false;
        });
    }
  }

  cancelTraing() {
    this.rootUrl = "";
    this.notifService.showWarning('Traing canceled.');
    this.modalService.dismissAll();
  }

  getTrainedLinks() {
    const pagination = { page: this.currentPage, limit: this.itemPerPage };
    let queryParams: any = { ...this.router.snapshot.queryParams, ...pagination };
    queryParams = this.objectToQueryString(queryParams);
    this.restService.getAll(API.main.site + `?${queryParams}`)
      .subscribe({
        next: (response: any) => {          
          this.trainedLinks = updateDataList(response, this.trainedLinks, null);
          const ctaId = this.router.snapshot.params['id'];
          if (ctaId) {
            this.getSelectedSite(ctaId);
          }
        },
        error: (error) => {

          console.log(error);
        }
      })
  }

  retrain() {
    if (this.selectedSite) {
      const urls = [];
      urls.push(this.selectedSite.url);
      if (urls.length > 0) {
        this.isTraing = true;
        this.restService.post(API.main.site + '/process', { urls: urls, agentId: this.agentId })
          .subscribe({
            next: (response: any) => {
              this.isTraing = false;
              this.getTrainedLinks();

            },
            error: (error) => {
              console.log(error);
              this.isTraing = false;

            }
          });
      }
    }
  }

  hasFailedLinks(): boolean {
    const failedLinks = this.trainedLinks.data.filter((link: any) => link.status === 'FAILED');
    return (failedLinks.length > 0);
  }

  retrainAll() {
    const failedUrls = this.trainedLinks.data
      .filter((link: any) => link.status === 'FAILED')
      .map((link: any) => link.url);

    if (failedUrls.length > 0) {

      this.isTraing = true;
      this.restService.post(API.main.site + '/process', { urls: failedUrls, agentId: this.agentId })
        .subscribe((response: any) => {
          this.isTraing = false;
          this.getTrainedLinks();
        }, (error) => {
          console.log(error);
          this.isTraing = false;
        });
    }
  }

  onPageChange(pageNumber: number) {
    this.currentPage = pageNumber;
    this.getTrainedLinks();
  }

  deleteSite() {
    this.sweetAlertService.warning("Delete Site", "Are you sure you want to delete ?", ['Delete', 'Cancel'], (confirm: any) => {
      if (confirm.isConfirmed) {
        this.deleteSubmit();
      }
    });
  }

  deleteSubmit() {
    if (this.selectedSite) {
      this.restService.delete(API.main.site, this.selectedSite.id)
        .subscribe((response: any) => {
          this.notifService.showSuccess("URL deleted successful.");
          this.modalService.dismissAll();
          this.getTrainedLinks();
        }, (error) => {
          console.log(error);
        });
    }
  }

  selectSite(item: any) {
    const queryParams = this.router.snapshot.queryParams;
    this.route.navigate(['/sites', item?.id], { queryParams: queryParams });
    this.getSelectedSite(item?.id);
  }

  getSelectedSite(id: string) {
    this.restService.get(API.main.site, id).subscribe({
      next: (response: any) => {
        this.selectedSite = response;
        console.log(response);
      },
      error: (error: any) => {
        this.notifService.showError(error.error.message);
      }
    });
  }

  processUrl(url: string): any {
    const urlObject = new URL(url);
    return urlObject;
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

  onListScrolledBottom() {
    const totalCount = this.trainedLinks?.total;
    const itemPerPage = this.itemPerPage;

    if (totalCount && itemPerPage) {
      const maxPage = Math.ceil(totalCount / itemPerPage);
      if (this.currentPage < maxPage) {
        this.currentPage++;
        this.getTrainedLinks();
      }
    } else {
      console.error('Total count or items per page not available');
    }
  }

  openGenerateGreetings() {
    this.offcanvasService.open(this.generateGreetingOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
    this.generateGreetings();
  }

  selectFromGenerated(item: any) {
    if (!this.selectedGreetings.includes(item)) {
      this.selectedGreetings.push(item);
    }
    else {
      const index = this.selectedGreetings.indexOf(item);
      this.selectedGreetings.splice(index, 1);
    }
  }

  generateGreetings() {
    this.isGeneratingGreetings = true;
    this.restService.post(API.main.site + "/generate",{})
      .subscribe((response: any) => {
        this.isGeneratingGreetings = false;
        this.generatedGreetings = response;
      }, (error) => {
        console.log(error);
        this.isGeneratingGreetings = false;
        this.notifService.showError(error.error.message);
      })
  }

  submitSelectGreetings() {
    if (this.selectedGreetings.length > 0) {
      const data = [...this.selectedGreetings];
      this.restService.post(API.main.site + "/select", data)
        .subscribe((response: any) => {
          this.selectedGreetings = [];
          this.offcanvasService.dismiss();
          this.trainedLinks = {};
          this.getTrainedLinks();
        }, (error) => {
          console.log(error);
          this.notifService.showError(error.error.message);
        })
    }
  }

}
