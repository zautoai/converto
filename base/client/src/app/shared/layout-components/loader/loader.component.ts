import { Component} from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [
    trigger('fadeOut', [
      state('false', style({ opacity: 1 })),
      state('true', style({ opacity: 0 })), 
      transition('false => true', animate('5000ms ease-out')),
    ])
  ]
})
export class LoaderComponent {
  constructor(public loaderService: LoaderService) {}

}
