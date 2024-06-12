import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignChartComponent } from './campaign-chart.component';

describe('CampaignChartComponent', () => {
  let component: CampaignChartComponent;
  let fixture: ComponentFixture<CampaignChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CampaignChartComponent]
    });
    fixture = TestBed.createComponent(CampaignChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
