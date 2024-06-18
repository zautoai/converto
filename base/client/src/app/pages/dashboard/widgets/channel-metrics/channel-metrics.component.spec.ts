import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelMetricsComponent } from './channel-metrics.component';

describe('ChannelMetricsComponent', () => {
  let component: ChannelMetricsComponent;
  let fixture: ComponentFixture<ChannelMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChannelMetricsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
