import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TableColumn, TableRow } from './widgets/table-card/table-card.component';
import { ChartCardComponent, ChartData } from './widgets/chart-card/chart-card.component';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { DateFilter } from 'src/app/common/enums';
import { forkJoin } from 'rxjs';

interface CountData{
  visitorCount:number;
  leadCount:number;
  convoCount:number;
  campaignCount:number;
}

export interface PercentageData {
  visitorPercentage: number;
  leadPercentage: number;
  conversationPercentage: number;
}

@Component({
  selector: 'app-zauto-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class ZautoDashboardComponent implements OnInit{

  intentScores: any = [];
  predictiveLeadScores: any = [];
  channelMetrics: any = {};
  pipelineValue: any = [];
  displayDateFilter: any = this.dateFilterFormator(DateFilter);
  selectedDateFilter: any = DateFilter.THIS_MONTH;
  startDate: string = '';
  endDate: string = '';
  DateFilter : any = DateFilter;

  constructor(
    public authService: AuthService,
    private restService: RestService
  ) { }

  ngOnInit(): void {
    this.getDashboardData();
  }

  removeUnderscore(str: string) {
    return str.replace(/_/g, ' ');
  }

  dateFilterFormator(dateFilter: any) {
    const result = [];
    for (let key in dateFilter) {
      result.push({
        key: key,
        value: dateFilter[key]
      });
    }
    return result;
  }

  getDashboardData() {
    this.getIntentScore(this.selectedDateFilter, this.selectedDateFilter === DateFilter.BETWEEN ? { start: this.startDate, end: this.endDate } : undefined);
    this.getPredictiveLeadScores(this.selectedDateFilter, this.selectedDateFilter === DateFilter.BETWEEN ? { start: this.startDate, end: this.endDate } : undefined);
    this.getChannelMetrics(this.selectedDateFilter, this.selectedDateFilter === DateFilter.BETWEEN ? { start: this.startDate, end: this.endDate } : undefined);
    this.getPipelineValueGenerator(this.selectedDateFilter, this.selectedDateFilter === DateFilter.BETWEEN ? { start: this.startDate, end: this.endDate } : undefined);
  }

  getIntentScore(dateFilter: string, range?: { start: string, end: string }) {
    const params = range 
      ? `dateFilter=${dateFilter}&start=${range.start}&end=${range.end}` 
      : `dateFilter=${dateFilter}`;
    this.restService.get(API.main.dashboard, `intent-score?${params}`).subscribe((res: any) => {
      this.intentScores = res.data;
    });
  }
  
  getPredictiveLeadScores(dateFilter: string, range?: { start: string, end: string }) {
    const params = range 
      ? `dateFilter=${dateFilter}&start=${range.start}&end=${range.end}` 
      : `dateFilter=${dateFilter}`;
    this.restService.get(API.main.dashboard, `predictive-lead-score?${params}`).subscribe((res: any) => {
      this.predictiveLeadScores = res.data;      
    });
  }

  getChannelMetrics(dateFilter: string, range?: { start: string, end: string }) {
    const params = range
      ? `dateFilter=${dateFilter}&start=${range.start}&end=${range.end}`
      : `dateFilter=${dateFilter}`;
    this.restService.get(API.main.dashboard, `channel-enhancement-metrics?${params}`).subscribe((res: any) => {
      this.channelMetrics = res.data;      
    });
  }

  getPipelineValueGenerator(dateFilter: string, range?: { start: string, end: string }) {
    const params = range
      ? `dateFilter=${dateFilter}&start=${range.start}&end=${range.end}`
      : `dateFilter=${dateFilter}`;
    this.restService.get(API.main.dashboard, `pipeline-value-generator?${params}`).subscribe((res: any) => {
        this.pipelineValue = res.data;
      });
  }
  
  onDateFilterChange() {
    if (this.selectedDateFilter !== DateFilter.BETWEEN) {
      this.getDashboardData();
    }    
  }

  onDateRangeChange() {
    if (this.selectedDateFilter === DateFilter.BETWEEN && this.startDate && this.endDate) {      
      this.getDashboardData();
    }
  }

  
}

