import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadConfigComponent } from './lead-config.component';

describe('LeadConfigComponent', () => {
  let component: LeadConfigComponent;
  let fixture: ComponentFixture<LeadConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeadConfigComponent]
    });
    fixture = TestBed.createComponent(LeadConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
