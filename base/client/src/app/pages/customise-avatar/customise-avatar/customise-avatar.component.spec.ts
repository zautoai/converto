import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomiseAvatarComponent } from './customise-avatar.component';

describe('CustomiseAvatarComponent', () => {
  let component: CustomiseAvatarComponent;
  let fixture: ComponentFixture<CustomiseAvatarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomiseAvatarComponent]
    });
    fixture = TestBed.createComponent(CustomiseAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
