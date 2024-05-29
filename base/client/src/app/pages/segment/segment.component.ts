import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { AvatarStyle } from '../customise-avatar/customise-avatar/customise-avatar.component';

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
  submittedData: any[] = [];
  submittedDatasegments: any[] = [];
  selectedSegmentID: any;
  selectedSegmentIDgrp: any;

  segmentGroup: FormGroup;
  segments: FormGroup;
  segment: any;
  displaySegment: any = null
  displaySegmentCategory: any = null

  constructor(
    private formBuilder: FormBuilder,
    private restService: RestService,
    private notifService: NotificationService,
    private sweetAlertService: SweetAlertService,
  ) {
    this.segmentGroup = this.formBuilder.group({
      name: [''],
      description: [''],
      id: [''],
      color: [''],
    });

    this.segments = this.formBuilder.group({
      name: [''],
      description: [''],
      segmentCategoryId: [''],
    });
  }
  ngOnInit(): void {
    this.getsegments();
    this.getSegmentgroup();
  }


  selectSegment(segment: any) {
    this.displaySegmentCategory = segment
    this.handleDisplaySegment(segment)
  }

  onCreateSegmentCategory() {
    const name = this.segmentGroup.value.name || '';
    const description = this.segmentGroup.value.description || '';
    const color = this.segmentGroup.value.color || '';
    console.log(color);
    if (this.segmentGroup.valid) {
      const data = {
        name: name,
        description: description,
        color: color
      };
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

  oncreatesegmente() {
    const name = this.segments.value.name || '';
    const description = this.segments.value.description || '';
    const segmentCategoryId = this.segments.value.segmentCategoryId || '';
    if (this.segments.valid) {
      const data = {
        name,
        description,
        segmentCategoryId
      };

      this.restService.post(API.main.segment, data).subscribe({
        next: (response: any) => {

          this.notifService.showSuccess('Segment Created Successfully.');
          this.getsegments();
          this.segments.reset();
        },
        error: (error) => {
          console.error(error);
        },
      });
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



  populateFormForUpdate(segment: any) {
    this.segments.patchValue({
      name: segment.name,
      description: segment.description,
      color: segment.color,
      segmentCategoryId: segment.segmentCategoryId,
      id: segment.id,
    });
    this.selectedSegmentID = segment.id;
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
