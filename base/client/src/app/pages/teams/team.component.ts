import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})

export class TeamComponent implements OnInit {
  @ViewChild('createUserOffcanvas') createUserOffcanvas: ElementRef | undefined;
  @ViewChild('updateUserOffcanvas') updateUserOffcanvas: ElementRef | undefined;
  @ViewChild('deleteModal') deleteModal: ElementRef | undefined;

  user: any= {};
  userList : any= [];
  selectedUser : any = undefined;
  isEdit: boolean = false;

  userForm: FormGroup;
  errorFeedback:any = {name:"",email:"",password:""};

  currentPage:number = 1;
  itemPerPage:number = 10;

  constructor(
    private modalService: NgbModal, 
    private notifService: NotificationService,
    private restService:RestService,
    private offcanvasService:NgbOffcanvas,
    private formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService,
    ) { 
      this.userForm =this.formBuilder.group({
        name:['',Validators.required],
        email:['',[Validators.required,Validators.email]],
        password:['',Validators.required],
      });
    }
  
  ngOnInit(): void {
   this.getUsers();
  }

  getUsers = () => {
    this.restService.get(API.main.orgUser,`?limit=${this.itemPerPage}&page=${this.currentPage}`)
    .subscribe((response:any)=>{
      this.userList = response;
    },(error)=>{
      console.log(error)
      this.notifService.showError(error.error.message);
    });
  }

  openCreateUser () {
    
    this.userForm.reset();
    this.resetErrorFeedback();
    this.offcanvasService.open(this.createUserOffcanvas,{
      position:'end',
      backdrop:'static',
      panelClass:'visible',
      animation: true,
    });
  }

  onCreateuserSubmit(){

    this.resetErrorFeedback();
    const name = this.userForm.value.name || "";
    const email = this.userForm.value.email || "";
    const password = this.userForm.value.password || "";

    if(this.userForm.valid)
    {
      const data = {
        name: name,
        email: email,
        password: password
      }
      this.restService.post(API.main.orgUser,data)
      .subscribe({next: (response: any) => {
          console.log(response);
         
          this.offcanvasService.dismiss();
          this.notifService.showSuccess('User Added Successfully.');
          this.getUsers();
      }, error: (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      }})
    }
    else
    {
      if(name.length <= 0)
      {
        this.errorFeedback.name = "Name required."
      }
      if(email.length <= 0)
      {
        this.errorFeedback.email = "Email required."
      }
      if(password.length <= 0)
      {
        this.errorFeedback.password = "password required."
      }
    }

  }

  openUpdateUser(user: any) {
    this.user = user;
    this.userForm.reset();
    this.resetErrorFeedback();
    this.userForm.patchValue(user);
    this.offcanvasService.open(this.updateUserOffcanvas,{
      position:'end',
      backdrop:'static',
      panelClass:'visible',
      animation: true,
    });
  }
  
  onUpdateuserSubmit(){  
    if(this.user)
    {
      const name = this.userForm.value.name || this.user.name || "";
      const email = this.userForm.value.email || this.user.email || "";
      const password = this.userForm.value.password || this.user.password || "";
      // this.user.rolesId = this.user.role.id;
      const data = {
        name: name,
        email: email,
        password: password,
      };
      
      this.restService.patch(API.main.orgUser,this.user.id,data)
      .subscribe((response: any) => {
        this.offcanvasService.dismiss();
        this.notifService.showSuccess('User Updated Successfully.');
        this.user = null;
        this.getUsers();
      },(error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      })
    }
  }

  delete = (user: any) => {
    this.user = user;
    // this.modalService.open(this.deleteModal,{centered:true});
    this.sweetAlertService.warning("Delete user","Are you sure you want to delete ?",['Delete','Cancel'],(confirm:any)=>{
      if(confirm.isConfirmed)
      {
        this.confirmDelete();
      }
    });
  }

  onSubmit = (userForm: any) => {
    this.modalService.dismissAll();
    this.notifService.showSuccess('User Added Successfully');
  }

  closeModal = () => {  
    this.user = {};
    this.isEdit = false;
    this.modalService.dismissAll();
  }

  confirmDelete = () => {
    this.restService.delete(API.main.orgUser,this.user.id)
    .subscribe((response: any) => {
      this.notifService.showSuccess('User Deleted Successfully.');
      this.getUsers()
      this.closeModal();
    },(error) => {
      console.error(error);
      this.notifService.showError(error.error.message);
    })
  }

  onPageChange(pageNumber:number)
  {
    this.currentPage = pageNumber;
    this.getUsers();
  }

  resetErrorFeedback()
  {
    let keys = Object.keys(this.errorFeedback);
    for (let key of keys) {
      this.errorFeedback[key] = "";
      
    }
  }
}
