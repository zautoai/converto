import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio = new Audio();

  constructor() {}

  load(url: string) {
    this.audio.src = url;
    this.audio.load();
  }

  play() {
    this.audio.play();
  }

  play5() {
    let count = 0;
    while(count < 5) {
        this.audio.play();
        count++;
    }
    
  }

  pause() {
    this.audio.pause();
  }
}
