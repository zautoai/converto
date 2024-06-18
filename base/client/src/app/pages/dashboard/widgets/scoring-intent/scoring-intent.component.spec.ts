import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoringIntentComponent } from './scoring-intent.component';

describe('ScoringIntentComponent', () => {
  let component: ScoringIntentComponent;
  let fixture: ComponentFixture<ScoringIntentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScoringIntentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScoringIntentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
