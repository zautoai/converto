import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalApisComponent } from './external-apis.component';

describe('ExternalApisComponent', () => {
  let component: ExternalApisComponent;
  let fixture: ComponentFixture<ExternalApisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExternalApisComponent]
    });
    fixture = TestBed.createComponent(ExternalApisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
