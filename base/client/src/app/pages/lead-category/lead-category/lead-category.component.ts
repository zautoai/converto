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
  selector: 'app-leadCategory',
  templateUrl: './lead-category.component.html',
  styleUrls: ['./lead-category.component.scss']
})
export class LeadCategoryComponent implements OnInit,AfterViewInit {

  // agentId:any = undefined;
  leadCategoryForm: FormGroup;
  errorFeedback: any = { title: "", desc: "", color: '' };
  selectedLeadCategory: any;
  selectedLeadCategoryStats: any;
  leadCategoryList: any = [];
  isOn: boolean = false;
  categoryColor: any = '#000000';

  searchTerm: string = '';
  private searchSubject: Subject<string> = new Subject<string>();

  // live scroll
  currentPage: number = 1;
  itemPerPage: number = 25;

  @ViewChild('createLeadCategoryOffcanvas') createLeadCategoryModal: ElementRef | any;
  @ViewChild('editLeadCategoryOffcanvas') editLeadCategoryModal: ElementRef | any;
  @ViewChild('deleteLeadCategoryModal') deleteLeadCategoryModal: ElementRef | any;
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
    this.leadCategoryForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      color: ['rgb(79, 195, 255)', Validators.required]
    });

    this.searchSubject.pipe(debounceTime(1000)).subscribe((term) => {
      this.currentPage = 1;
      this.leadCategoryList = {};
      this.searchTerm = term;
      this.selectedLeadCategory = null;
      this.getLeadCategorys();
    });
  }

  ngOnInit(): void {
    this.getLeadCategorys();
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

  getLeadCategorys() {
    let queryParams: any = null;
    const searchQ = { searchQ: this.searchTerm.trim().toLowerCase() };
    const pagination = { page: this.currentPage, limit: this.itemPerPage };
    queryParams = { ...this.route.snapshot.queryParams, ...pagination, ...searchQ };
    queryParams = this.objectToQueryString(queryParams);
    let endpoint = API.main.leadCategory + `?${queryParams}`;

    this.restService.getAll(endpoint)
      .subscribe((response: any) => {
        this.leadCategoryList = updateDataList(response, this.leadCategoryList, null);
        const leadCategoryId = this.route.snapshot?.params['id'];
        console.log(leadCategoryId)
        this.selectLeadCategory(this.getLeadCategoryById(leadCategoryId));
      }, (error) => {
        console.log(error);
      });
  }

  getPlatforms() {

  }

  selectLeadCategory(leadCategory: any) {
    const queryParams = this.route.snapshot.queryParams;
    this.router.navigate(['/lead-categories', leadCategory.id], { queryParams: queryParams });
    setTimeout(() => {
      this.selectedLeadCategory = leadCategory;
    }, 100)
    
  }

  getSelectedLeadCategory(id: string) {
    this.restService.get(API.main.leadCategory, id)
      .subscribe((response: any) => {
        this.selectedLeadCategory = response;
        
      }, (error) => {
        console.log(error);
        this.notifService.showError(error.error.message);
      });
  }

  openCreateLeadCategory() {
    this.leadCategoryForm.reset();
    this.resetErrorFeedback();
    this.offcanvasService.open(this.createLeadCategoryModal, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  openEditLeadCategory() {
    this.resetErrorFeedback();
    this.leadCategoryForm.reset();
    if (this.selectedLeadCategory) {
      this.leadCategoryForm.get('title')?.setValue(this.selectedLeadCategory.title);
      this.leadCategoryForm.get('description')?.setValue(this.selectedLeadCategory.description);
    }
    this.offcanvasService.open(this.editLeadCategoryModal, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  openDeleteLeadCategory() {
    // this.modalService.open(this.deleteLeadCategoryModal, { size: 'md', centered: true });
    this.sweetAlertService.warning("Delete LeadCategory","Are you sure you want to delete ?",['Delete','Cancel'],(confirm:any)=>{
      if(confirm.isConfirmed)
      {
        this.onDeleteLeadCategorySubmit();
      }
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onCreateLeadCategorySubmit() {
    this.resetErrorFeedback();
    const title: string = this.leadCategoryForm.value.title || "";
    const desc: string = this.leadCategoryForm.value.description || "";
    const color: string = this.leadCategoryForm.value.color || "";

    if (this.leadCategoryForm.valid) {
      const data = {
        title: title,
        description: desc,
        color: color,
      };
      this.restService.post(API.main.leadCategory, data)
        .subscribe((response: any) => {
          this.getLeadCategorys();
          this.leadCategoryForm.reset();
          this.offcanvasService.dismiss();
          this.notifService.showSuccess("New LeadCategory created.");
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
    }
  }

  onEditLeadCategorySubmit() {
    this.resetErrorFeedback();
    const title: string = this.leadCategoryForm.value.title || "";
    const desc: string = this.leadCategoryForm.value.description || "";
    const color: string = this.leadCategoryForm.value.color || "";

    if (this.leadCategoryForm.valid) {
      const data: any = {
        title: title,
        description: desc,
        color: color,
      };

      if (this.selectedLeadCategory) {
        this.restService.patch(API.main.leadCategory, this.selectedLeadCategory.id, data)
          .subscribe((response: any) => {
            this.getLeadCategorys();
            this.leadCategoryForm.reset();
            this.offcanvasService.dismiss();
            this.notifService.showSuccess("LeadCategory updated.");
            this.selectedLeadCategory = response;
            
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
    }
  }

  onDeleteLeadCategorySubmit() {
    if (this.selectedLeadCategory && !this.selectedLeadCategory.isDefault) {
      this.restService.delete(API.main.leadCategory, this.selectedLeadCategory.id)
        .subscribe((response: any) => {
          this.closeModal();
          this.getLeadCategorys();
          this.selectedLeadCategory = null;
          this.router.navigate(['/lead-categories']);
          this.notifService.showSuccess("LeadCategory deleted.");
        }, (error) => {
          console.log(error);
        });

    }
  }

  getLeadCategoryById(id: string) {
    const LeadCategory = this.leadCategoryList.data.find((LeadCategory: any) => LeadCategory.id === id);
    return LeadCategory; 
  }


  toggleStatus() {
    if (this.selectedLeadCategory) {
      let newStatus: string;

      if (this.selectedLeadCategory.status === 'ACTIVE') {
        newStatus = 'INACTIVE';
      } else if (this.selectedLeadCategory.status === 'INACTIVE') {
        newStatus = 'ACTIVE';
      } else {
        return;
      }

      const data = { status: newStatus };
      this.restService.patch(API.main.leadCategory, this.selectedLeadCategory.id, data)
        .subscribe((response: any) => {
          this.getLeadCategorys();
          this.leadCategoryForm.reset();
          this.closeModal();
          this.selectedLeadCategory = response;
        }, (error) => {
          console.log(error);
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
    const control = this.leadCategoryForm.get(fieldName)!;
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
    const totalCount = this.leadCategoryList?.total;
    const itemPerPage = this.itemPerPage;

    if (totalCount && itemPerPage) {
      const maxPage = Math.ceil(totalCount / itemPerPage);
      if (this.currentPage < maxPage) {
        this.currentPage++;
        this.getLeadCategorys();
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

  onColorChange(color: any) {
    this.leadCategoryForm.controls["color"].setValue(color, {
      emitEvent: false,
    });
  }

}
