import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { AdvanceOffcanvasComponent } from 'src/app/components/advance-offcanvas/advance-offcanvas.component';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { AbmCardComponent } from './components/abm-card/abm-card.component';

@Component({
  selector: 'app-abm',
  templateUrl: './abm.component.html',
  styleUrl: './abm.component.scss'
})
export class AbmComponent {
openViewContact(_t3: any) {
throw new Error('Method not implemented.');
}

  @ViewChild('createUserOffcanvas') createUserOffcanvas: ElementRef | undefined;
  @ViewChild('updateUserOffcanvas') updateUserOffcanvas: ElementRef | undefined;
  @ViewChild('deleteModal') deleteModal: ElementRef | undefined;

  abm: any = {};
  currentPage: number = 0;
  limit: number = 5;
  abmList: any[] = [];
  selectedData: any = null;
  totalItems: number = 0;
  isEdit: boolean = false;
  isLoading: boolean = false;
  selectedabm:any


  @ViewChild('viewcanvas') viewcanvas!: AdvanceOffcanvasComponent
  @ViewChild('composeCanva') composeCanva!: AdvanceOffcanvasComponent
  constructor(
    private notifService: NotificationService,
    private restService: RestService,
    private offcanvasService: NgbOffcanvas,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router:Router,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.limit = +params['limit'] || this.limit;
      this.getAccounts();
      this.onPageChange({ page: this.currentPage })
    });
  }

  errorMessages = {
    accountName: {
      required: 'Email is required'
    }
  };

  abmForm: FormGroup = new FormGroup({
    accountName: new FormControl(null, [Validators.required]),
    industry: new FormControl(),
    companySize: new FormControl(),
    annualRevenue: new FormControl(),
    accountType: new FormControl(),
    website: new FormControl(),
    address: new FormControl(),
    city: new FormControl(),
    state: new FormControl(),
    zip: new FormControl(),
    country: new FormControl(),
    phone: new FormControl(),
    email: new FormControl(),
    socialMedia: new FormControl(),
    notes: new FormControl(),
    source: new FormControl(),
    status: new FormControl(),
  });



  getAccounts(): void {
    this.restService
      .get(API.main.abm, `?limit=${this.limit}&page=${this.currentPage}`)
      .subscribe(
        (response: any) => {
          this.abmList = response.data;
          this.totalItems = response.total
        },
        (error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
        },
      );
  }
  openCreateUser() {
  }
  openViewUser(data: any) {
  }

  onCreateuserSubmit() {
    const formData: { [key: string]: string | null } = this.abmForm.value;

    const data = Object.entries(formData)
      .filter(([_, value]) => value !== null)
      .reduce((acc, [key, value]) => {
        if (value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as { [key: string]: string });


    this.restService.post(API.main.account, data).subscribe({
      next: (response: any) => {

        this.offcanvasService.dismiss();
        this.notifService.showSuccess('Accounts Added Successfully.');
        this.getAccounts();
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    });
  }

  openUpdateUser(data: any) {

  }

  onUpdateuserSubmit(): void {

  }


  delete = (data: any) => {

  };

  closeModal = () => {

  };

  confirmDelete = (data: any) => {
    this.restService.delete(API.main.account, data.id).subscribe(
      (response: any) => {
        this.notifService.showSuccess('Accounts Deleted Successfully.');
        this.closeModal();
        this.getAccounts()
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  };

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.getAccounts();
  }

  get form() {
    return this.abmForm.controls;
  }

  get accountName() {
    return this.abmForm.get('accountName') as FormControl;
  }

  get email() {
    return this.abmForm.get('email') as FormControl;
  }

  get phone() {
    return this.abmForm.get('phone') as FormControl;
  }

  get accountType() {
    return this.abmForm.get('accountType') as FormControl;
  }

  get status() {
    return this.abmForm.get('status') as FormControl;
  }

  get notes() {
    return this.abmForm.get('notes') as FormControl;
  }

  get source() {
    return this.abmForm.get('source') as FormControl;
  }

  get industry() {
    return this.abmForm.get('industry') as FormControl;
  }

  get companySize() {
    return this.abmForm.get('companySize') as FormControl;
  }

  get annualRevenue() {
    return this.abmForm.get('annualRevenue') as FormControl;
  }

  get website() {
    return this.abmForm.get('website') as FormControl;
  }

  get address() {
    return this.abmForm.get('address') as FormControl;
  }

  get city() {
    return this.abmForm.get('city') as FormControl;
  }

  get state() {
    return this.abmForm.get('state') as FormControl;
  }

  get zip() {
    return this.abmForm.get('zip') as FormControl;
  }

  get country() {
    return this.abmForm.get('country') as FormControl;
  }

  get socialMedia() {
    return this.abmForm.get('socialMedia') as FormControl;
  }
  selectabm(abm:any){
  this.selectedabm=abm;
  this.router.navigate(['abm',abm.id])
  this.getActiveAbm(abm.id)
  }
  getActiveAbm(id:string){
    this.selectedabm = null;
    if(!id || id == 'all') {
      return;
    }
    this.restService.get(API.main.account, id).subscribe(
      (response: any) => {
        this.selectedabm = response.data;
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  }
}
