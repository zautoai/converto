import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageReplacementComponent } from './page-replacement.component';

describe('PageReplacementComponent', () => {
  let component: PageReplacementComponent;
  let fixture: ComponentFixture<PageReplacementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageReplacementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PageReplacementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
