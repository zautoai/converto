import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadCategoryComponent } from './lead-category.component';

describe('LeadCategoryComponent', () => {
  let component: LeadCategoryComponent;
  let fixture: ComponentFixture<LeadCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeadCategoryComponent]
    });
    fixture = TestBed.createComponent(LeadCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
