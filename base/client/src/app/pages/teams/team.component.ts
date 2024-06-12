import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { PaginationData } from 'src/app/common/intefaces';
import { AdvanceOffcanvasComponent } from 'src/app/components/advance-offcanvas/advance-offcanvas.component';
import { markFormGroupAsDirty } from 'src/app/components/advanced-inputs/input.util';
import { AdvancedModalsComponent } from 'src/app/components/advanced-modals/advanced-modals/advanced-modals.component';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})

export class TeamComponent implements OnInit {
  @ViewChild(AdvanceOffcanvasComponent) teamComposeOffcanvas!: AdvanceOffcanvasComponent;
  @ViewChild(AdvancedModalsComponent) deleteFormModal!: AdvancedModalsComponent;

  user: any= {};
  usersData : any= null;
  selectedUser : any = undefined;
  isEdit: boolean = false;
  totalPages: number = 1;
  limit = 5;

  form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required,Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required,Validators.minLength(3)]),
  });

  errorMessages = {
    name: {
      required: 'Name is required',
      minlength: 'Name must be at least 3 characters long',
      maxlength: 'Name must be less than 50 characters long',
    },
    email: {
      required: 'Email is required',
      email: 'Email is not valid',
    },
    password: {
      required: 'Password is required',
      minlength: 'Password must be at least 3 characters long',
      maxlength: 'Password must be less than 50 characters long',
    },
  }

  totalItems: number = 0;
  currentPage:number = 1;
  itemPerPage:number = 10;

  isLoading:boolean = false;

  constructor(
    private notifService: NotificationService,
    private restService:RestService) {}
  
  ngOnInit(): void {
   this.getUsers();
  }

  get name():FormControl {
    return this.form.get('name') as FormControl;
  }

  get email():FormControl {
    return this.form.get('email') as FormControl;
  }

  get password():FormControl {
    return this.form.get('password') as FormControl;
  }

  getUsers = () => {
    this.restService.get(API.main.user,`?limit=${this.itemPerPage}&page=${this.currentPage}`)
    .subscribe((response:any)=>{
      this.usersData = response;
      this.usersData.data = this.usersData.data.filter((user:any) => user.role.name == 'user');
    },(error)=>{
      console.log(error)
      this.notifService.showError(error.error.message);
    });
  }

  openCreateUser () {
    this.isEdit = false;
    this.user = {};
    this.form.reset();
    this.teamComposeOffcanvas.open();
  }

  openUpdateUser(user: any) {
    this.isEdit = true;
    this.user = user;
    this.form.reset();
    this.form.patchValue(user);
    this.form.removeControl('password'); 
    this.teamComposeOffcanvas.open();
  }

  openDeleteForm(entity:any){
    this.deleteFormModal.open(entity);
  }

  onPageChanged(data:PaginationData){
    this.currentPage=data.page;
    this.limit=data.limit
    this.getUsers()
  }

  onSubmit(){
    if(this.form.valid){
      this.isLoading = true;
      if(this.isEdit)
      {
        const data = this.form.value;
        this.restService.patch(API.main.user,this.user.id,data)
        .subscribe((response: any) => {
          this.teamComposeOffcanvas.close();
          this.notifService.showSuccess('User Updated Successfully.');
          this.user = null;
          this.getUsers();
          this.isLoading = false;
        },(error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
          this.isLoading = false;
        })
      }
      else
      {
        const data = this.form.value;
        this.restService.post(API.main.user,data)
        .subscribe({next: (response: any) => {     
            this.teamComposeOffcanvas.close();    
            this.notifService.showSuccess('User Added Successfully.');
            this.getUsers();
            this.isLoading = false;
        }, error: (error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
          this.isLoading = false;
        }})
      }
    }
    else
    {
      markFormGroupAsDirty(this.form);
      this.isLoading = false;
    }
  }

  onDeleteSubmit(entity:any){
    this.isLoading = false;
    console.log(entity);
    this.restService.delete(API.main.user,entity.id)
    .subscribe((response: any) => {
      this.notifService.showSuccess('User Deleted Successfully.');
      this.getUsers()
      this.isLoading = false;
    },(error) => {
      console.error(error);
      this.notifService.showError(error.error.message);
      this.isLoading = false;
    })
  }

  onPageChange(event:any)
  {
    this.currentPage = event.page;
    this.getUsers();
  }

  closeComposeCanvas(){
    this.teamComposeOffcanvas.close();
  }
  
}
