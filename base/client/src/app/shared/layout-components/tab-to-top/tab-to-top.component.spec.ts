import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabToTopComponent } from './tab-to-top.component';

describe('TabToTopComponent', () => {
  let component: TabToTopComponent;
  let fixture: ComponentFixture<TabToTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabToTopComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabToTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
