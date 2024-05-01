import { Component, OnInit } from '@angular/core';
import { SwitcherService } from 'src/app/shared/services/switcher.service';
@Component({
  selector: 'app-switcher-layout',
  templateUrl: './switcher-layout.component.html',
  styleUrls: ['./switcher-layout.component.scss']
})
export class SwitcherLayoutComponent implements OnInit {

  constructor(public SwitcherService : SwitcherService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(){
    location.reload()
  }

  mainSidebarOpen: any;
  hoverEffect($event:any) {
    this.mainSidebarOpen = $event.type == 'mouseover' ? 'sidenav-toggled-open' : '';
  }


}
