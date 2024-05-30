import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { forkJoin } from 'rxjs';
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
  isEdit: boolean = false;
  icpId: string = '';

  constructor(
    private restService: RestService,
    private notifService: NotificationService,
    private sweetAlertService: SweetAlertService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.icpForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      score: [0, [Validators.required, this.rangeValidator(0, 100)]],
      segmentIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      segments: this.restService.getAll(API.main.segment),
      segmentCategories: this.restService.getAll(API.main.segmentCategory)
    }).subscribe({
      next: ({ segments, segmentCategories }) => {
        this.segmentData = (segments as any).data;
        this.segmentCategoryData = (segmentCategories as any).data;
        this.checkForEdit();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  checkForEdit(): void {
    this.route.paramMap.subscribe(params => {
      this.icpId = params.get('id') || ""; // Retrieve the 'id' parameter
    });
    if (this.icpId !== "") {
      this.isEdit = true
      this.restService.get(API.main.icp, this.icpId).subscribe({
        next: (response: any) => {
          const icp = response.data;
          const segmentIds = icp.segment.map((m: any) => m.id)
          this.icpForm.patchValue({
            name: icp.name,
            description: icp.description,
            score: icp.score,
            segmentIds
          });
          this.populateSegments(segmentIds);
        },
        error: (error) => {
          console.error(error);
        },
      });
    }
  }

  populateSegments(segmentIds: any[]): void {
    this.selectedSegments = this.segmentData.filter((segment: any) => segmentIds.includes(segment.id));
    this.displaySegments = [];

    this.segmentCategoryData.forEach((category: any) => {
      const categorySegments = this.segmentData.filter((segment: any) => segment.segmentCategoryId === category.id && segmentIds.includes(segment.id)).map((segment: any) => segment.name);

      if (categorySegments.length > 0) {
        this.displaySegments.push({ name: category.name, segments: categorySegments });
      }
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

    this.icpForm.patchValue({
      segmentIds: this.selectedSegments.map((segment: any) => segment.id)
    });

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
      if (this.isEdit && this.icpId) {
        this.updateIcp(formData);
      } else {
        this.createIcp(formData);
      }
    } else {
      console.error('Form is invalid');
    }
  }

  createIcp(formData: any): void {
    this.restService.post(API.main.icp, formData).subscribe({
      next: (response: any) => {
        this.notifService.showSuccess('ICP created successfully.');
        this.icpForm.reset();
        this.router.navigate(['/icp']);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateIcp(formData: any): void {
    this.restService.patch(API.main.icp, this.icpId, formData).subscribe({
      next: (response: any) => {
        this.notifService.showSuccess('ICP updated successfully.');
        this.icpForm.reset();
        this.router.navigate(['/icp']);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  handleDiscard() {
    this.icpForm.reset();
    this.router.navigate(['/icp']);
  }

  rangeValidator(min: number, max: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value < min || value > max) {
        return { rangeError: `Value must be between ${min} and ${max}` };
      }
      return null;
    };
  }
}
