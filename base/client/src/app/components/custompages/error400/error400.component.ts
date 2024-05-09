import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-error400',
  templateUrl: './error400.component.html',
  styleUrls: ['./error400.component.scss']
})
export class Error400Component implements OnInit {

  constructor(@Inject(DOCUMENT) private document: Document,
  private renderer: Renderer2,) {

  }

  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'login-img');


  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'login-img');
}
}
