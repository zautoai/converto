import { Component, Input } from '@angular/core';
import { CRMPlugin } from '../plugins.component';

@Component({
  selector: 'app-plugin-card',
  templateUrl: './plugin-card.component.html',
  styleUrl: './plugin-card.component.scss'
})
export class PluginCardComponent {

  @Input() data:CRMPlugin = new CRMPlugin();
}
