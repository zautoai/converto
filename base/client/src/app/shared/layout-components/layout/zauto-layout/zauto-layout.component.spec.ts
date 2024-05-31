import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZautoLayoutComponent } from './zauto-layout.component';

describe('ZautoLayoutComponent', () => {
  let component: ZautoLayoutComponent;
  let fixture: ComponentFixture<ZautoLayoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ZautoLayoutComponent]
    });
    fixture = TestBed.createComponent(ZautoLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
