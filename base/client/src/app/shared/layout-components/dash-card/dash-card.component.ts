import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DashCardType } from 'src/app/shared/data/dashboard/dashboardData';
import { RestService } from '../../services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from '../../services/notification.service';
import { DateFilter } from 'src/app/common/enums';

interface Widget {
  title: string;
  subtitle: string;
  currentValue: string;
  pastPeriod: string;
  icon?: string; // Optional property for the icon
  change?: string; // Optional property for the change percentage
  color?: string; // Optional property for the color
}

@Component({
  selector: 'app-dash-card',
  templateUrl: './dash-card.component.html',
  styleUrls: ['./dash-card.component.scss']
})
export class DashCardComponent implements OnInit, OnChanges {

  constructor(
    private restService: RestService,
    private notifService: NotificationService,
  ) { }
  ngOnInit(): void {
    this.getBottomWidget(this.selectedDateFilter, this.selectedDateFilter === DateFilter.BETWEEN ? { start: this.startDate, end: this.endDate } : undefined)
    this.getTopWidget(this.selectedDateFilter, this.selectedDateFilter === DateFilter.BETWEEN ? { start: this.startDate, end: this.endDate } : undefined)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDateFilter'] || changes['startDate'] || changes['endDate']) {
      if (this.selectedDateFilter === DateFilter.BETWEEN && (!this.startDate || !this.endDate)) return
      this.getBottomWidget(this.selectedDateFilter, this.selectedDateFilter === DateFilter.BETWEEN ? { start: this.startDate, end: this.endDate } : undefined)
      this.getTopWidget(this.selectedDateFilter, this.selectedDateFilter === DateFilter.BETWEEN ? { start: this.startDate, end: this.endDate } : undefined);
    }
  }
  @Input() selectedDateFilter: any = DateFilter.THIS_MONTH;
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  showLoader: boolean = false;

  topWidgets: Widget[] = [
    { title: 'Total PV', subtitle: '', currentValue: '$ 0', pastPeriod: '' },
    { title: 'Total CAC', subtitle: '', currentValue: '$ 0', pastPeriod: '' },
    { title: 'Total CPL', subtitle: '', currentValue: '$ 0', pastPeriod: '' }
  ]

  bottomWidgets: Widget[] = [
    { title: 'Total visits', subtitle: '', currentValue: '0', pastPeriod: '', icon: 'eye' },
    { title: 'Total new Leads', subtitle: '', currentValue: '0', pastPeriod: '', icon: 'user' },
    { title: 'Total new Accounts', subtitle: '', currentValue: '0', pastPeriod: '', icon: 'briefcase' }
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

  getBottomWidget(dateFilter: string, range?: { start: string, end: string }) {
    const params = range
      ? `dateFilter=${dateFilter}&start=${range.start}&end=${range.end}`
      : `dateFilter=${dateFilter}`;
    this.showLoader = true;
    this.restService.get(API.main.dashboard, `bottom-widget?${params}`)
      .subscribe(
        (response: any) => {
          this.bottomWidgets = response.data
          setTimeout(() => {
            this.showLoader = false
          }, 1000);
        },
        (error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
        },
      );
  }

  getTopWidget(dateFilter: string, range?: { start: string, end: string }) {
    const params = range
      ? `dateFilter=${dateFilter}&start=${range.start}&end=${range.end}`
      : `dateFilter=${dateFilter}`;
    this.showLoader = true;
    this.restService.get(API.main.dashboard, `top-widget?${params}`)
      .subscribe(
        (response: any) => {
          this.topWidgets = response.data
          setTimeout(() => {
            this.showLoader = false
          }, 1000);
        },
        (error) => {
          console.error(error);
          this.notifService.showError(error.error.message);
        },
      );
  }
}
