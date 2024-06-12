import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmCardComponent } from './abm-card.component';

describe('AbmCardComponent', () => {
  let component: AbmCardComponent;
  let fixture: ComponentFixture<AbmCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AbmCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AbmCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
