import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { defaultAvatarStyle } from 'src/app/common/avatarStyle';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { AvatarStyle } from '../customise-avatar/customise-avatar/customise-avatar.component';
import { NgxColorsColor } from 'ngx-colors';




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

  avatarStyle: AvatarStyle;

  avatarStyles = {
    primaryColor: 'green',
  };
  
  Form: FormGroup;
  segments: FormGroup;
  selectedSegment: any = null;
  selectedSegmentgrp: any = null;
  segment: any;
  
 


  constructor(
    private formBuilder: FormBuilder,
    private restService: RestService,
    private notifService: NotificationService,
    private avatarService: AvatarService,
    private sweetAlertService: SweetAlertService,
  ) {
    this.Form = this.formBuilder.group({
      name: [''],
      description: [''],
      id:['']
    });

    this.avatarStyle = defaultAvatarStyle;
    console.log(avatarService);
    

    this.segments = this.formBuilder.group({
      name: [''],
      description: [''],
      groupname: [''],
      color: [''],
  
    });
  }
  ngOnInit(): void {
    this.getsegments();
    this.getSegmentgroup();
    this.getSegmentgroup();
  }

 
  selectSegment(segment: any) {
    this.selectedSegment = segment;
  }
  selectgrpSegment(segment: any) {
    this.selectedSegmentgrp = segment;
  }



  onCreatesegmantfrpformSubmit() {
    const name = this.Form.value.name || '';
    const description = this.Form.value.description || '';
    if (this.Form.valid) {
      const data = {
        name: name,
        description: description,
      };
      this.restService.post(API.main.segment, data).subscribe({
        next: (response: any) => {
          this.Form.reset();
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
    this.restService.getAll(API.main.segment).subscribe({
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
      'Delete form',
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
    this.restService.delete(API.main.segment, this.segment.id).subscribe(
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
    this.Form.patchValue({
      id: segment.id,
      name: segment.name,
      description: segment.description,
    });
    this.selectedSegmentIDgrp = segment.id;
  }
  updatesegmentgrp() {
    const updatedData = this.Form.value;

    console.log(updatedData);

    if (this.selectedSegmentIDgrp) {
      this.restService
        .patch(API.main.segment, this.selectedSegmentIDgrp, updatedData)
        .subscribe(
          (response: any) => {
            this.notifService.showSuccess(
              'Segment Group Updated Successfully.',
            );
            this.getsegments();
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
    const segmentGroupId = this.segments.value.groupname || '';
    const color = this.segments.value.color || '';
    console.log(color);

    if (this.segments.valid) {
      const data = {
        name: name,
        description: description,
        color: color,
        segmentGroupId: segmentGroupId,
      };

      this.restService.post(API.main.segments, data).subscribe({
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
    this.restService.getAll(API.main.segments).subscribe({
      next: (response: any) => {
        this.submittedDatasegments = response.data;
        console.log(this.submittedDatasegments);
       
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  findSegmentById(segmentId: '0e3337f4-8e98-4a27-b3ae-7301c26fcbc9'): void {
    this.restService.get(API.main.segments, segmentId).subscribe({
      next: (response: any) => {
        const segment = response.data;
        console.log(segment);
        this.populateFormForUpdate(segment);
      },
      error: (error) => {
        console.error(error);
        this.notifService.showError('Segment not found.');
      },
    });
  }




  deletedeletesegment = (segment: any) => {
    this.segment = segment;
    
    this.sweetAlertService.warning(
      'Delete form',
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
    this.restService.delete(API.main.segments, this.segment.id).subscribe(
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
      groupname: segment.groupname,
      id: segment.id,
    });
    this.selectedSegmentID = segment.id;
  }

  updatesegment() {
    const updatedData = this.segments.value;

    console.log(updatedData);

    this.restService
      .patch(API.main.segments, this.selectedSegmentID, updatedData)
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
}
