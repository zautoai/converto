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
export class ZautoDashboardComponent implements OnInit, AfterViewInit {

  DateFilter = DateFilter;
  dateFilter = Object.values(DateFilter);
  selectedDateFilter:string = DateFilter.THIS_WEEK;
  startDate:string | null = null;
  endDate:string | null = null;
  isLoading:boolean = false;

  countData: CountData = {
    visitorCount: 0,
    leadCount: 0,
    convoCount: 0,
    campaignCount: 0
  };

  tableColumns: TableColumn[] = [
    { key: 'name', name: 'Name' },
    { key: 'visitcount', name: 'Impressions' },
    { key: 'convocount', name: 'Conversations' },
    { key: 'leadcount', name: 'Contacts' },
  ];
  topCampaignData: TableRow[] = [];

  chartData: ChartData[] = [];
  categories: string[] = [];
  @ViewChild(ChartCardComponent, { static: false }) chart!: ChartCardComponent;



  constructor(
    public authService: AuthService,
    private restService:RestService) { }


  ngOnInit(): void {
    this.getDashboardData();
  }

  ngAfterViewInit(): void {
    this.updateChartData();
  }

  getDashboardData()
  {
    if(this.selectedDateFilter == DateFilter.BETWEEN && (!this.startDate || !this.endDate))
    {
      return;
    }
    let dateQuery = (this.selectedDateFilter == DateFilter.BETWEEN && (this.startDate && this.endDate)) ? `&startDate=${this.startDate}&endDate=${this.endDate}` : '';
    dateQuery = `dateFilter=${this.selectedDateFilter}`+dateQuery;

    this.isLoading = true;
    forkJoin([
      this.getCountData(dateQuery),
      this.getChartData(dateQuery),
      this.getTopCampaigns(dateQuery)
    ]).subscribe({
      next: ([countData, chartData, topCampaignData]) => {
        this.countData = countData as any;
        this.handleChartData(chartData as any);
        this.topCampaignData = topCampaignData as any;       
        this.isLoading = false;
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
      }
    });
  }

  removeUnderscore(value: string): string {
    return value.replace(/_/g, ' ');
  }

  handleProgressData(data: any):PercentageData {
    const { visitorCount, leadCount, convoCount } = data;

    const visitorPercentage = (visitorCount / visitorCount) * 100;
    const leadPercentage = (leadCount / visitorCount) * 100;
    const conversationPercentage = (convoCount / visitorCount) * 100;

    // Calculate proportions of 100%
    const totalPercentage = visitorPercentage + leadPercentage + conversationPercentage;
    const visitorProportion = (visitorPercentage / totalPercentage) * 100;
    const leadProportion = (leadPercentage / totalPercentage) * 100;
    const conversationProportion = (conversationPercentage / totalPercentage) * 100;

    return {
        visitorPercentage: +visitorProportion.toFixed(2) || 0,
        leadPercentage: +leadProportion.toFixed(2) || 0,
        conversationPercentage: +conversationProportion.toFixed(2) || 0
    };
  }

  handleChartData(data: any)
  {
    this.chartData = [
      {
        name: 'Impressions',
        data: [...data.visitorData.values],
        color: '#9752FC'
      },
      {
        name: 'Conversations',
        data: [...data.convoData.values],
        color: '#FFEB3B'
      },
      {
        name: 'Contacts',
        data: [...data.leadData.values],
        color: '#A0E09E'
      },
    ];
    this.categories = data.labels
    this.chart.updateChartData(this.chartData, this.categories);
  }

  getCountData(filter:string) {
    return this.restService.get(API.main.dashboard,`counts?${filter}`);
  }
  
  getChartData(filter:string) {
    return this.restService.get(API.main.dashboard, `chart?${filter}`);
  }

  getTopCampaigns(filter:string)
  {
    return this.restService.get(API.main.dashboard, `top-campaigns?${filter}`);
  }

  private generateDummyData(numRows: number): TableRow[] {
    const dummyData: TableRow[] = [];
    for (let i = 1; i <= numRows; i++) {
      const row: TableRow = {};
      this.tableColumns.forEach(column => {
        row[column.key] = this.getRandomValue();
      });
      dummyData.push(row);
    }
    return dummyData;
  }

  private getRandomValue(): number {
    return Math.floor(Math.random() * 1000);
  }

  generateChartDummyData() {
    const labels = [
      "2018-09-19T00:00:00.000Z",
      "2018-09-20T00:00:00.000Z",
      "2018-09-21T00:00:00.000Z",
      "2018-09-22T00:00:00.000Z",
      "2018-09-23T00:00:00.000Z",
      "2018-09-24T00:00:00.000Z",
      "2018-09-25T00:00:00.000Z"
    ];

    const visitorsData: number[] = [];
    const leadsData: number[] = [];
    const conversationsData: number[] = [];

    for (let i = 0; i < labels.length; i++) {
      visitorsData.push(Math.floor(Math.random() * (100 - 50 + 1)) + 50); // Random number between 50 and 100 for visitors
      leadsData.push(Math.floor(Math.random() * (100 - 50 + 1)) + 50); // Random number between 50 and 100 for leads
      conversationsData.push(Math.floor(Math.random() * (100 - 50 + 1)) + 50); // Random number between 50 and 100 for conversations
    }

    return {
      chartData: [
        {
          name: 'Impressions',
          data: visitorsData,
          color: '#9752FC'
        },
        {
          name: 'Leads',
          data: leadsData,
          color: '#FFEB3B'
        },
        {
          name: 'Conversations',
          data: conversationsData,
          color: '#A0E09E'
        }
      ],
      categories: labels,
    };
  }

  updateChartData(): void {
    // const newData = this.generateChartDummyData();
    // this.chartData = newData.chartData;
    // this.categories = newData.categories;
    // this.chart.updateChartData(this.chartData, this.categories);
  }

}

