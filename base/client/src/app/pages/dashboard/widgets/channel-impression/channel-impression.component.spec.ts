import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelImpressionComponent } from './channel-impression.component';

describe('ChannelImpressionComponent', () => {
  let component: ChannelImpressionComponent;
  let fixture: ComponentFixture<ChannelImpressionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChannelImpressionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelImpressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
