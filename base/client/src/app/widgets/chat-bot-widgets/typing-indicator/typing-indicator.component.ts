import { OnInit, Component, OnDestroy, Input } from '@angular/core';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';

@Component({
  selector: 'app-typing-indicator',
  templateUrl: './typing-indicator.component.html',
  styleUrls: ['./typing-indicator.component.scss']
})
export class TypingIndicatorComponent implements OnInit, OnDestroy{

  GLOBAL_IMAGES = GLOBAL_IMAGES;
  typingText:string = "";

  private intervalId: any; 

  chatPhrases = [
    "Typing...",
    "Typing...",
  ];

  @Input() avatar:any = null;

  @Input() fontSize = 14;
  @Input() textColor = '#ffffff';
  @Input() background = '#9752FC'

  ngOnInit(): void {
    this.setRandomTypingText();
    this.startRandomPhraseTimer();
  }

  ngOnDestroy(): void {
    if(this.intervalId)
    {
      clearInterval(this.intervalId);
    }
  }

  private setRandomTypingText() {
    const index = Math.floor(Math.random() * this.chatPhrases.length);
    this.typingText = "";
    this.typingText += this.chatPhrases[index];
  }

  private startRandomPhraseTimer() {
    const intervalInSeconds = 2;

    this.intervalId = setInterval(() => {
        this.setRandomTypingText();
    }, intervalInSeconds * 1000);
  }
}
