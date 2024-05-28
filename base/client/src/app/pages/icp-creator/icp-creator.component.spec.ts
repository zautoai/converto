import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcpCreatorComponent } from './icp-creator.component';

describe('IcpCreatorComponent', () => {
  let component: IcpCreatorComponent;
  let fixture: ComponentFixture<IcpCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IcpCreatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IcpCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
