import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';

@Component({
  selector: 'app-icp-creator',
  templateUrl: './icp-creator.component.html',
  styleUrls: ['./icp-creator.component.scss'],
})
export class IcpCreatorComponent implements OnInit {
  segmentData: any = [];
  segmentCategoryData: any = [];
  selectedSegments: any = [];
  displaySegments: any = [];
  icpForm: FormGroup;

  constructor(
    private restService: RestService,
    private notifService: NotificationService,
    private sweetAlertService: SweetAlertService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.icpForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      startValue: [0, Validators.required], // Added startValue field
      segmentIds: [[]] // Empty array to store selected segment IDs
    });
  }

  ngOnInit(): void {
    this.getSegments();
    this.getSegmentCategory();
  }

  getSegments(): void {
    this.restService.getAll(API.main.segment).subscribe({
      next: (response: any) => {
        this.segmentData = response.data;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getSegmentCategory(): void {
    this.restService.getAll(API.main.segmentCategory).subscribe({
      next: (response: any) => {
        this.segmentCategoryData = response.data;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  isSelected(id: any): boolean {
    return this.selectedSegments.some((segment: any) => segment.id === id);
  }

  onSegmentChange(event: any, segmentCategory: any, segment: any): void {
    if (event.target.checked) {
      this.selectedSegments.push(segment);
    } else {
      this.selectedSegments = this.selectedSegments.filter((s: any) => s.id !== segment.id);
    }

    // Update segmentIds in the form control
    this.icpForm.patchValue({
      segmentIds: this.selectedSegments.map((segment: any) => segment.id)
    });

    // Update displaySegments
    this.updateDisplaySegments(segmentCategory, segment, event.target.checked);
  }

  updateDisplaySegments(segmentCategory: any, segment: any, isSelected: boolean): void {
    const categoryName = segmentCategory.name;

    if (isSelected) {
      let category = this.displaySegments.find((cat: any) => cat.name === categoryName);
      if (!category) {
        category = { name: categoryName, segments: [] };
        this.displaySegments.push(category);
      }
      category.segments.push(segment.name);
    } else {
      let category = this.displaySegments.find((cat: any) => cat.name === categoryName);
      if (category) {
        category.segments = category.segments.filter((name: string) => name !== segment.name);
        if (category.segments.length === 0) {
          this.displaySegments = this.displaySegments.filter((cat: any) => cat.name !== categoryName);
        }
      }
    }
  }

  hasSelectedSegmentsInCategory(categoryId: any): boolean {
    return this.selectedSegments.some((segment: any) => segment.segmentCategoryId === categoryId);
  }

  onSubmit(): void {
    if (this.icpForm.valid) {
      const formData = this.icpForm.value;
      console.log('Form Data:', formData);
      // Submit the form data to the server or perform other actions here.
    } else {
      console.error('Form is invalid');
    }
  }
}
