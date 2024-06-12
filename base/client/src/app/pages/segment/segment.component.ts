import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { AvatarStyle } from '../customise-avatar/customise-avatar/customise-avatar.component';
import { AdvanceOffcanvasComponent } from 'src/app/components/advance-offcanvas/advance-offcanvas.component';
import { markFormGroupAsDirty } from 'src/app/components/advanced-inputs/input.util';

export interface avatarStyle {
  primaryColor: string;
  textColor: string;
  fontSize: number;
  icon?: string;
}


@Component({
  selector: 'app-segment',
  templateUrl: './segment.component.html',
  styleUrl: './segment.component.scss',
})

export class SegmentComponent implements OnInit {
  @ViewChild("segmentCategoryOffCanvas") segmentCategoryOffCanvas!: AdvanceOffcanvasComponent;
  @ViewChild("segmentOffCanvas") segmentOffCanvas!: AdvanceOffcanvasComponent;

  segmentGroup: FormGroup = new FormGroup({
    name: new FormControl("", [Validators.required]),
    description: new FormControl(""),
    color: new FormControl("", [Validators.required]),
  })
  segments: FormGroup = new FormGroup({
    name: new FormControl("",[Validators.required]),
    description: new FormControl(""),
    segmentCategoryId: new FormControl(null,[Validators.required]),
  })

  submittedData: any[] = [];
  submittedDatasegments: any[] = [];
  selectedSegmentID: any;
  selectedSegmentIDgrp: any;
  isEdit: boolean = false;
  segment: any;
  displaySegment: any = null
  displaySegmentCategory: any = null

  isLoading: boolean = false

  errorMessages = {
    title: {
      required: 'Title is required',
      minlength: 'Title must be at least 3 characters long',
      maxlength: 'Title must be less than 50 characters long',
    },
  };
  constructor(
    private formBuilder: FormBuilder,
    private restService: RestService,
    private notifService: NotificationService,
    private sweetAlertService: SweetAlertService,
  ) {


    this.segments = this.formBuilder.group({
      name: [''],
      description: [''],
      segmentCategoryId: [null],
    });

  }
  ngOnInit(): void {
    this.getsegments();
    this.getSegmentgroup();
  }


  get name(): FormControl {
    return this.segmentGroup.get('name') as FormControl;
  }

  get description(): FormControl {
    return this.segmentGroup.get('description') as FormControl;
  }
  get color(): FormControl {
    return this.segmentGroup.get('color') as FormControl;
  }

  get segmentName(): FormControl {
    return this.segments.get('name') as FormControl;
  }

  get segmentdescription(): FormControl {
    return this.segments.get('description') as FormControl;
  }
  get segmentCategoryId(): FormControl {
    return this.segments.get('segmentCategoryId') as FormControl;
  }
  
  closeComposeCanvas(){
    this.segmentCategoryOffCanvas.close();
    this.segmentOffCanvas.close();
    this.segmentGroup.reset();  // Reset form on close
    this.segments.reset();  // Reset form on close
    this.isEdit = false;
    
  }

  opensegment() {
    this.isEdit = false;
    // this.form.reset();
    this.segmentOffCanvas.open();
  }

  opensegmentcategory() {
    this.isEdit = false;
    // this.form.reset();
    this.segmentCategoryOffCanvas.open();
  }


  selectSegment(segment: any) {

    this.displaySegmentCategory = segment
    this.handleDisplaySegment(segment)
  }

  onCreateSegmentCategory() {



    if (this.segmentGroup.valid) {
      const data = this.segmentGroup.value;
      console.log(data);

      this.restService.post(API.main.segmentCategory, data).subscribe({
        next: (response: any) => {
          this.segmentGroup.reset();
          this.notifService.showSuccess('Segment Created Successfully.');
          this.getSegmentgroup();
        },
        error: (error) => {
          console.error(error);
        },
      });
    }
    else {
      markFormGroupAsDirty(this.segmentGroup);
      this.isLoading = false;
    }

  }

  getSegmentgroup(): void {
    this.restService.getAll(API.main.segmentCategory).subscribe({
      next: (response: any) => {
        this.submittedData = response.data;        
      },
      error: (error) => {
        console.error(error);
      },
    });
  }



  deletesegmentgroup = (segment: any) => {
    this.segment = segment;

    this.sweetAlertService.warning(
      'Delete Segment Category',
      'Are you sure you want to delete ?',
      ['Delete', 'Cancel'],
      (confirm: any) => {
        if (confirm.isConfirmed) {
          this.confirmsegmentgrpDelete();
        }
      },
    );
  };



  confirmsegmentgrpDelete = () => {
    this.restService.delete(API.main.segmentCategory, this.segment.id).subscribe(
      (response: any) => {
        this.notifService.showSuccess('Form Deleted Successfully.');
        this.getSegmentgroup();

      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  };




  populateselect(segment: any) {
    this.segmentGroup.patchValue({
      id: segment.id,
      name: segment.name,
      description: segment.description,
      color: segment.color
    });
    this.selectedSegmentIDgrp = segment.id;
    this.isEdit = true;
    this.segmentCategoryOffCanvas.open();
  }
  updatesegmentgrp() {
    const updatedData = this.segmentGroup.value;
    if (this.selectedSegmentIDgrp) {
      this.restService
        .patch(API.main.segmentCategory, this.selectedSegmentIDgrp, updatedData)
        .subscribe(
          (response: any) => {
            this.notifService.showSuccess(
              'Segment Group Updated Successfully.',
            );
            this.getSegmentgroup();
            this.segmentGroup.reset();
            this.segmentCategoryOffCanvas.close();  // Close offcanvas after update
            this.isEdit = false;
          },
          (error) => {
            console.error(error);
            this.notifService.showError(error.error.message);
          },
        );
    } else {
      console.error('Segment ID is undefined');
    }
  }

  oncreatesegment() {
    console.log(this.segments.value);
    
    if (this.segments.valid) {
      const data = this.segments.value;
      console.log(data); 
  
      this.restService.post(API.main.segment, data).subscribe({
        next: (response: any) => {
          this.notifService.showSuccess('Segment Created Successfully.');
          this.getsegments();
          this.segments.reset(); 
          this.segmentOffCanvas.close(); 
        },
        error: (error) => {
          console.error(error);
          this.notifService.showError('Error creating segment.');
        },
      });
    } else {
      console.log("called");
      
      markFormGroupAsDirty(this.segments);
      this.isLoading = false;
    }
  }


  getsegments(): void {
    this.restService.getAll(API.main.segment).subscribe({
      next: (response: any) => {
        this.submittedDatasegments = response.data;
        if (this.displaySegmentCategory) {
          this.handleDisplaySegment(this.displaySegmentCategory)
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deletedeletesegment = (segment: any) => {
    this.segment = segment;

    this.sweetAlertService.warning(
      'Delete Segment',
      'Are you sure you want to delete ?',
      ['Delete', 'Cancel'],
      (confirm: any) => {
        if (confirm.isConfirmed) {
          this.confirmDelete();
        }
      },
    );
  };



  confirmDelete = () => {
    this.restService.delete(API.main.segment, this.segment.id).subscribe(
      (response: any) => {
        this.notifService.showSuccess('Form Deleted Successfully.');
        this.getsegments();

      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  };

  onSubmitSegmentCategory() {
    if (this.segmentGroup.valid) {
      const data = this.segmentGroup.value;
      console.log(data);
      this.isLoading = true;
      if (this.isEdit) {
        this.restService.patch(API.main.segmentCategory, this.selectedSegmentIDgrp, data)
          .subscribe((response: any) => {
            this.getSegmentgroup();
            this.segmentGroup.reset();
            this.notifService.showSuccess("Segment category updated.");
            this.selectedSegmentIDgrp = response.id;
            this.isLoading = false;
          }, (error) => {
            this.isLoading = false;
            console.log(error);
          });
      } else {
        this.restService.post(API.main.segmentCategory, data)
          .subscribe((response: any) => {
            this.getSegmentgroup();
            this.segmentGroup.reset();
            this.notifService.showSuccess("New segment category created.");
            this.isLoading = false;
          }, (error) => {
            this.notifService.showError(error.error.message);
            console.log(error);
            this.isLoading = false;
          });
      }
    } else {
      markFormGroupAsDirty(this.segmentGroup);
      this.isLoading = false;
    }
  }

  onSubmitSegment() {
    if (this.segments.valid) {
      const data = this.segments.value;
      console.log(data);
      this.isLoading = true;
      if (this.isEdit) {
        this.restService.patch(API.main.segment, this.selectedSegmentID, data)
          .subscribe((response: any) => {
            this.getsegments();
            this.segments.reset();
            this.notifService.showSuccess("Segment updated.");
            this.selectedSegmentID = response.id;
            this.isLoading = false;
          }, (error) => {
            this.isLoading = false;
            console.log(error);
          });
      } else {
        this.restService.post(API.main.segment, data)
          .subscribe((response: any) => {
            this.getsegments();
            this.segments.reset();
            this.notifService.showSuccess("New segment created.");
            this.isLoading = false;
          }, (error) => {
            this.notifService.showError(error.error.message);
            console.log(error);
            this.isLoading = false;
          });
      }
    } else {
      markFormGroupAsDirty(this.segments);
      this.isLoading = false;
    }
  }
  
  


  populateFormForUpdate(segment: any) {
    this.segments.patchValue({
      name: segment.name,
      description: segment.description,
      color: segment.color,
      segmentCategoryId: segment.segmentCategoryId,
      id: segment.id,
    });
    this.selectedSegmentID = segment.id;
    this.isEdit = true;
    this.segmentOffCanvas.open();
  }

  updatesegment() {
    const updatedData = this.segments.value;
    this.segments.reset();
    this.restService
      .patch(API.main.segment, this.selectedSegmentID, updatedData)
      .subscribe(
        (response: any) => {
          this.notifService.showSuccess('Segment Group Updated Successfully.');
          this.getsegments();
          this.segments.reset();
          this.segmentOffCanvas.close();  // Close offcanvas after update
          this.isEdit = false; 
        },
        (error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
        },
      );
  }

  handleDisplaySegment(segmentCategory: any) {
    this.displaySegment = this.submittedDatasegments.filter(m => m.segmentCategoryId === segmentCategory.id);
  }
}
