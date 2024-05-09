import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SMTPConfigComponent } from './smtpconfig.component';

describe('SMTPConfigComponent', () => {
  let component: SMTPConfigComponent;
  let fixture: ComponentFixture<SMTPConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SMTPConfigComponent]
    });
    fixture = TestBed.createComponent(SMTPConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
