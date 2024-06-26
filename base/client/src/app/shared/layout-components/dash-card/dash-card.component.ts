import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { DashCardType } from 'src/app/shared/data/dashboard/dashboardData';
import { RestService } from '../../services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from '../../services/notification.service';

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
export class DashCardComponent implements OnInit {

  constructor(    
    private restService: RestService,
    private notifService: NotificationService,
  ){}
  ngOnInit(): void {
    this.getBottomWidgetData()
    this.getTopWidgetData()
  }

  type = DashCardType;
  @Input() showLoader: boolean = false;
  @Input() cardType: DashCardType = DashCardType.default;
  @Input() title: string = "";
  @Input() icon: string = "";
  @Input() currentValue: number = 0;
  @Input() maxValue: number = 0;
  @Input() color: string = "primary";

  @ViewChild('myCanvas') myCanvas: ElementRef | any;

  topWidgetsData : any = {}
  bottomWidgetData : any = {};
  
  topWidgets: Widget[] =[
    { title: 'Total PVG', subtitle: 'This month', currentValue: '$' + (this.topWidgetsData?.currentPVG?.toFixed(2) || '0'), pastMonth: 'Past month $'+(this.topWidgetsData?.previousPVG?.toFixed(2) || '0') },
    { title: 'Total CAC', subtitle: 'This month', currentValue: '$'+ (this.topWidgetsData?.currentCAC?.toFixed(2) || '0'), pastMonth: 'Past month $'+(this.topWidgetsData?.previousCAC?.toFixed(2) || '0') },
    { title: 'Total CPL', subtitle: 'This month', currentValue: '$'+ (this.topWidgetsData?.currentCPL?.toFixed(2) || '0'), pastMonth: 'Past month $'+(this.topWidgetsData?.previousCPL?.toFixed(2) || '0') }
  ]

  bottomWidgets: Widget[] = [
    { title: 'Total visits', subtitle: 'This month', currentValue: this.bottomWidgetData?.currentMonthVisitCount || '0', pastMonth: 'Past month '+ ( this.bottomWidgetData?.previousMonthVisitCount || '0'), icon: 'user', ...this.calculateChange(this.bottomWidgetData?.currentMonthVisitCount || 0, this.bottomWidgetData?.previousMonthVisitCount || 0) },
    { title: 'Total new Leads', subtitle: 'This month', currentValue:  this.bottomWidgetData?.currentMonthContactCount ||'0', pastMonth: 'Past month '+ ( this.bottomWidgetData?.previousMonthContactCount || '0'), icon: 'user', ...this.calculateChange(this.bottomWidgetData?.currentMonthContactCount || 0, this.bottomWidgetData?.previousMonthContactCount || 0) },
    { title: 'Total new Accounts', subtitle: 'This month', currentValue:  this.bottomWidgetData?.currentMonthAccountCount ||'0', pastMonth: 'Past month '+ ( this.bottomWidgetData?.previousMonthAccountCount || '0'), icon: 'user', ...this.calculateChange(this.bottomWidgetData?.currentMonthAccountCount || 0, this.bottomWidgetData?.previousMonthAccountCount || 0) }
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

  calculateChange(current: number, previous: number): { change: string, color: string } {
    if (previous === 0) {
      return { change: current === 0 ? '0%' : '+100%', color: 'success' };
    }

    if (current === 0) {
      return { change: '-100%', color: 'danger' };
    }

    const isPositive = current >= previous;
    const change = isPositive ? current - previous : previous - current;
    const changePercentage = (change / previous) * 100;
        
    return {
      change: `${isPositive ? '+' : '-'}${changePercentage.toFixed(2)}%`,
      color: isPositive ? 'success' : 'danger'
    };
  }

  
  getBottomWidgetData() {
    this.restService.get(API.main.dashboard,'bottom-widget')
    .subscribe(
      (response: any) => {
        this.bottomWidgetData = response.data;
        this.bottomWidgets=[
          { title: 'Total visits', subtitle: 'This month', currentValue: this.bottomWidgetData?.currentMonthVisitCount || '0', pastMonth: 'Past month '+ ( this.bottomWidgetData?.previousMonthVisitCount || '0'), icon: 'user', ...this.calculateChange(this.bottomWidgetData?.currentMonthVisitCount || 0, this.bottomWidgetData?.previousMonthVisitCount || 0) },
          { title: 'Total new Leads', subtitle: 'This month', currentValue:  this.bottomWidgetData?.currentMonthContactCount ||'0', pastMonth: 'Past month '+ ( this.bottomWidgetData?.previousMonthContactCount || '0'), icon: 'user', ...this.calculateChange(this.bottomWidgetData?.currentMonthContactCount || 0, this.bottomWidgetData?.previousMonthContactCount || 0) },
          { title: 'Total new Accounts', subtitle: 'This month', currentValue:  this.bottomWidgetData?.currentMonthAccountCount ||'0', pastMonth: 'Past month '+ ( this.bottomWidgetData?.previousMonthAccountCount || '0'), icon: 'user', ...this.calculateChange(this.bottomWidgetData?.currentMonthAccountCount || 0, this.bottomWidgetData?.previousMonthAccountCount || 0) }
        ]
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  }

  getTopWidgetData() {
    this.restService.get(API.main.dashboard, 'top-widget')
    .subscribe(
      (response: any) => {
        this.topWidgetsData = response.data;
        console.log(this.topWidgetsData);
        
        this.topWidgets=[
          { title: 'Total PVG', subtitle: 'This month', currentValue: '$' + (this.topWidgetsData?.currentPVG?.toFixed(2) || '0'), pastMonth: 'Past month $'+(this.topWidgetsData?.previousPVG?.toFixed(2) || '0') },
          { title: 'Total CAC', subtitle: 'This month', currentValue: '$'+ (this.topWidgetsData?.currentCAC?.toFixed(2) || '0'), pastMonth: 'Past month $'+(this.topWidgetsData?.previousCAC?.toFixed(2) || '0') },
          { title: 'Total CPL', subtitle: 'This month', currentValue: '$'+ (this.topWidgetsData?.currentCPL?.toFixed(2) || '0'), pastMonth: 'Past month $'+(this.topWidgetsData?.previousCPL?.toFixed(2) || '0') }
        ]
      },
      (error) => {
        console.error(error);
        this.notifService.showError(error.error.message);
      },
    );
  }
}
