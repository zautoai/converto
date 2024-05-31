import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarEventComponent } from './calendar-event.component';

describe('CalendarEventComponent', () => {
  let component: CalendarEventComponent;
  let fixture: ComponentFixture<CalendarEventComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalendarEventComponent]
    });
    fixture = TestBed.createComponent(CalendarEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
