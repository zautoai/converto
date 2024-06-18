import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictiveLeadComponent } from './predictive-lead.component';

describe('PredictiveLeadComponent', () => {
  let component: PredictiveLeadComponent;
  let fixture: ComponentFixture<PredictiveLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PredictiveLeadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PredictiveLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
