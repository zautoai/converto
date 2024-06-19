import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { updateDataList } from 'src/app/common/utils';
import { AdvanceOffcanvasComponent } from 'src/app/components/advance-offcanvas/advance-offcanvas.component';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { ScrollUtilService } from 'src/app/shared/services/scroll-util.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
@Component({
  selector: 'app-call-to-action',
  templateUrl: './call-to-action.component.html',
  styleUrls: ['./call-to-action.component.scss']
})
export class CallToActionComponent implements OnInit, AfterViewInit {
  @ViewChild(AdvanceOffcanvasComponent) CtaComposeCanvas!: AdvanceOffcanvasComponent;
  @ViewChild('generateCTAOffcanvas', { static: false }) generateCTAOffcanvas: ElementRef | any;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  ctaList: any = [];
  selectedCta: any = null;
  errorFeedback: any = { name: "", description: "", link: "", type: "" };
  currentPage: number = 1;
  itemPerPage: number = 25;
  isEdit: boolean = false;
  isLoading: boolean = false;
  isGeneratingCTA: boolean = false;
  generatedCTAS: any = [];
  selectedCtas: any = [];
  ctaTypes = [
    {
      name: 'CTA',
      value: 'CTA',
    },
    {
      name: 'NAVIGATOR',
      value: 'NAVIGATOR',
    },
    {
      name: 'CALENDAR',
      value: 'CALENDAR',
    }
  ];

  ctaForm: FormGroup = new FormGroup({
    name: new FormControl ('', [Validators.required]),
    description: new FormControl ('',[Validators.required]),
    link: new FormControl ('',[]),
    type: new FormControl (null, [Validators.required]),
  });


  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private offcanvasService: NgbOffcanvas,
    private restService: RestService,
    private notifService: NotificationService,
    private sweetAlertService: SweetAlertService,
    private scrollService: ScrollUtilService
  ) {
    
  }
  ngOnInit(): void {
    this.getAllCta();
  }
  ngAfterViewInit(): void {
    const containerElement = this.scrollContainer.nativeElement;
    this.scrollService.containerReachedBottom(containerElement)
      .subscribe({
        next: (reachedBottom) => {
          if (reachedBottom) {
            this.onListScrolledBottom();
          }
        }
      });
    this.scrollService.containerReachedTop(containerElement)
      .subscribe({
        next: (reachedTop) => {
          if (reachedTop) {
          }
        }
      });
  }
  getAllCta() {
    const pagination = { page: this.currentPage, limit: this.itemPerPage };
    let queryParams: any = { ...this.router.snapshot.queryParams, ...pagination };
    queryParams = this.objectToQueryString(queryParams);
    this.restService.getAll(API.main.cta + `?${queryParams}`).subscribe({
      next: (response: any) => {
        this.ctaList = updateDataList(response, this.ctaList, null);
        const ctaId = this.router.snapshot.params['id'];
        if (ctaId) {
          this.getSelectedCta(ctaId);
        }
      },
      error: (error: any) => {
        this.notifService.showError(error.error.message);
      }
    });
  }
  openCreateCta() {
    this.resetErrorFeedback();
    this.ctaForm.reset();
    this.isEdit = false;
    this.type.setValue(null)
    this.CtaComposeCanvas.open()
  }
  onCreateSubmit() {
    this.resetErrorFeedback();
    const data=this.ctaForm.value 
      this.restService.post(API.main.cta, data).subscribe({
        next: (response: any) => {
          this.notifService.showSuccess("New Call to action created");
          this.ctaForm.reset();
          this.resetErrorFeedback();
          this.offcanvasService.dismiss();
          this.getAllCta();
        },
        error: (error: any) => {
          this.notifService.showError(error.error.message);
        }
      });
   
   
  }
  openUpdateCta() {
    if (this.selectedCta) {
      this.resetErrorFeedback();
      this.ctaForm.reset();
      console.log(this.ctaForm.value);
      this.ctaForm.patchValue(this.selectedCta);
      console.log(this.ctaForm.value);
      this.isEdit = true;
      this.CtaComposeCanvas.open();
    }
  }
  onUpdateSubmit() {
    this.resetErrorFeedback();
    const name: string = this.ctaForm.value.name || "";
    const description: string = this.ctaForm.value.description || "";
    const link: string = this.ctaForm.value.link || "";
    const type: string = this.ctaForm.value.type || "";
    if (this.ctaForm.valid) {
      const data = { name, description, link, type };
      const entpoint = API.main.cta;
      this.restService.patch(entpoint, this.selectedCta?.id, data).subscribe({
        next: (response: any) => {
          this.notifService.showSuccess("Call to action updated");
          this.ctaForm.reset();
          this.resetErrorFeedback();
          this.offcanvasService.dismiss();
          this.getAllCta();
        },
        error: (error: any) => {
          this.notifService.showError(error.error.message);
        }
      });
    }
    else {
      if (name.length <= 0) {
        this.errorFeedback.name = "Name required.";
      }
      if (description.length <= 0) {
        this.errorFeedback.description = "Description required.";
      }
      if (link.length <= 0) {
        this.errorFeedback.link = "Link required.";
      }
    }
  }
  openDeleteCta() {
    this.sweetAlertService.warning("Delete CTA", "Are you sure you want to delete ?", ['Delete', 'Cancel'], (confirm: any) => {
      if (confirm.isConfirmed) {
        this.onDeleteSubmit();
      }
    });
  }
  onDeleteSubmit() {
    if (this.selectedCta) {
      const entpoint = API.main.cta;
      this.restService.delete(entpoint, this.selectedCta?.id).subscribe({
        next: (response: any) => {
          this.notifService.showSuccess("Call to action deleted");
          this.selectedCta = null;
          this.route.navigate(['/call-to-action']);
        },
        error: (error: any) => {
          this.notifService.showError(error.error.message);
        }
      });
    }
  }
  openGenerateCta() {
    this.resetErrorFeedback();
    this.ctaForm.reset();
    this.offcanvasService.open(this.generateCTAOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
    this.generateCTAS();
  }
  generateCTAS() {
    this.isGeneratingCTA = true;
    this.restService.post(API.main.cta + "/generate", {})
      .subscribe((response: any) => {
        this.isGeneratingCTA = false;
        this.generatedCTAS = response;
      }, (error) => {
        console.log(error);
        this.isGeneratingCTA = false;
        this.notifService.showError(error.error.message);
      })
  }
  selectCta(item: any) {
    const queryParams = this.router.snapshot.queryParams;
    this.route.navigate(['/call-to-action', item?.id], { queryParams: queryParams });
    this.getSelectedCta(item?.id);
  }
  getSelectedCta(id: string) {
    this.restService.get(API.main.cta, id).subscribe({
      next: (response: any) => {
        this.selectedCta = response;
      },
      error: (error: any) => {
        this.notifService.showError(error.error.message);
      }
    });
  }
  isFieldValid(fieldName: string): boolean {
    const control = this.ctaForm.get(fieldName)!;
    return control.invalid && control.dirty;
  }
  resetErrorFeedback() {
    let keys = Object.keys(this.errorFeedback);
    for (let key of keys) {
      this.errorFeedback[key] = "";
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
  onListScrolledBottom() {
    const totalCount = this.ctaList?.total;
    const itemPerPage = this.itemPerPage;
    if (totalCount && itemPerPage) {
      const maxPage = Math.ceil(totalCount / itemPerPage);
      if (this.currentPage < maxPage) {
        this.currentPage++;
        this.getAllCta();
      }
    } else {
      console.error('Total count or items per page not available');
    }
  }
  selectFromGenerated(cta: any) {
    if (!this.selectedCtas.includes(cta)) {
      this.selectedCtas.push(cta);
    }
    else {
      const index = this.selectedCtas.indexOf(cta);
      this.selectedCtas.splice(index, 1);
    }
  }
  submitSelectCTAS() {
    if (this.selectedCtas.length > 0) {
      const data = [...this.selectedCtas];
      this.restService.post(API.main.cta + "/select", data)
        .subscribe((response: any) => {
          this.generatedCTAS = response;
          this.selectedCtas = [];
          this.offcanvasService.dismiss();
          this.ctaList = {};
          this.getAllCta();
        }, (error) => {
          console.log(error);
          this.notifService.showError(error.error.message);
        })
    }
  }

  get name(): FormControl {
    return this.ctaForm.get('name') as FormControl
  }
  get description(): FormControl {
    return this.ctaForm.get("description") as FormControl
  }
  get link(): FormControl {
    return this.ctaForm.get("link") as FormControl
  }
  get type(): FormControl {
    return this.ctaForm.get("type") as FormControl
  }
  onCancel() { 
      this.offcanvasService.dismiss();
      this.ctaForm.reset();
      this.resetErrorFeedback();
  }
}