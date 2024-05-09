import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBotWidgetsComponent } from './chat-bot-widgets.component';

describe('ChatBotWidgetsComponent', () => {
  let component: ChatBotWidgetsComponent;
  let fixture: ComponentFixture<ChatBotWidgetsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatBotWidgetsComponent]
    });
    fixture = TestBed.createComponent(ChatBotWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
