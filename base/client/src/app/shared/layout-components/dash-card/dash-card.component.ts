import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DashCardType } from 'src/app/shared/data/dashboard/dashboardData';

interface Widget {
  title: string;
  subtitle: string;
  currentValue: string;
  pastMonth: string;
  icon?: string; // Optional property for the icon
  change?: string; // Optional property for the change percentage
  color?: string; // Optional property for the color
}

@Component({
  selector: 'app-dash-card',
  templateUrl: './dash-card.component.html',
  styleUrls: ['./dash-card.component.scss']
})
export class DashCardComponent {
  type = DashCardType;
  @Input() showLoader: boolean = false;
  @Input() cardType: DashCardType = DashCardType.default;
  @Input() title: string = "";
  @Input() icon: string = "";
  @Input() currentValue: number = 0;
  @Input() maxValue: number = 0;
  @Input() color: string = "primary";

  @ViewChild('myCanvas') myCanvas: ElementRef | any;

  topWidgets: Widget[] = [
    { title: 'Total PVG', subtitle: 'this month', currentValue: '$400', pastMonth: 'Past month $450' },
    { title: 'Total CAC', subtitle: 'this month', currentValue: '$293', pastMonth: 'Past month $298' },
    { title: 'Total CPL', subtitle: 'this month', currentValue: '$150', pastMonth: 'Past month $578' }
  ];

  bottomWidgets: Widget[] = [
    { title: 'Total visits', subtitle: 'this month', currentValue: '1.7K', pastMonth: 'Past month 2K', icon: 'user', change: '12%', color: 'success' },
    { title: 'Total new Leads', subtitle: 'this month', currentValue: '1.7K', pastMonth: 'Past month 2K', icon: 'user', change: '12%', color: 'success' },
    { title: 'Total new Accounts', subtitle: 'this month', currentValue: '1.7K', pastMonth: 'Past month 2K', icon: 'user', change: '12%', color: 'success' }
  ];

  getColor(color: string): any {
    const colors: any = {
      primary: { border: "#9752FC ", background: "rgba(151,82,252,0.1)" },
      success: { border: "#21C44C", background: "rgba(33,196,76,0.1)" },
      danger: { border: "#F5334F", background: "rgba(245,51,79,0.1)" },
      warning: { border: "#FFB209", background: "rgba(255,178,9,0.1)" },
      info: { border: "#0099FF", background: "rgba(0,153,255,0.1)" },
    };

    return colors[color];
  }

  calculatePercentage(currentValue: number, maxValue: number) {
    return Math.round((currentValue / maxValue) * 100);
  }
}
