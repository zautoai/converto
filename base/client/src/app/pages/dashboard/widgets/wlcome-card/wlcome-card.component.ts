import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-wlcome-card',
  templateUrl: './wlcome-card.component.html',
  styleUrls: ['./wlcome-card.component.scss']
})
export class WlcomeCardComponent {

  welcomeText:string = '';
  @Input() name: string = '';
  @Input() description: string = 'Here is what’s happening with your campaigns today';

  constructor() {
    this.setWelcomeText();
  }

  private setWelcomeText(): void {
    const currentTime = new Date().getHours();

    if (currentTime >= 0 && currentTime < 12) {
      this.welcomeText = 'Good morning';
    } else if (currentTime >= 12 && currentTime < 18) {
      this.welcomeText = 'Good afternoon';
    } else {
      this.welcomeText = 'Good evening';
    }

    // You can append the name here if needed
    if (this.name) {
      this.welcomeText += `, ${this.name}`;
    }
  }
}
