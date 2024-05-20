import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountviewComponent } from './accountview.component';

describe('AccountviewComponent', () => {
  let component: AccountviewComponent;
  let fixture: ComponentFixture<AccountviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
