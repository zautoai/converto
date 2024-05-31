import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ApexChart, ApexDataLabels, ApexGrid, ApexMarkers, ApexPlotOptions, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';

export interface ChartData {
  name: string;
  data: number[];
  color: string;
}

export interface ChartOptions {
  series: ChartData[];
  chart: ApexChart;
  colors: string[];
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  markers: ApexMarkers;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  apexTooltip:ApexTooltip;
  plotOptions?:ApexPlotOptions;
}


@Component({
  selector: 'app-chart-card',
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.scss']
})
export class ChartCardComponent implements OnInit{

  @Input() isLoading:boolean = false;
  @Input() title!: string;
  @ViewChild(ChartComponent,{ static: false }) chart!: ChartComponent;
  @Input() chartData: ChartData[] = [];
  @Input() categories: string[] = [];

  chartOptions!: ChartOptions;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    this.chartOptions = {
      series: [],
      chart: {
        height: 250,
        type: 'area',
        zoom: {
          enabled: true,
        },
      },
      colors: ['#9752FC ', '#00E396', '#CED4DC'],
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          borderRadius: 1,
          horizontal: false,
          columnWidth: '45%',
          dataLabels:{
            position: 'top'
          }
        }
      },
      stroke: {
        curve: 'smooth',
        width: 1,
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5,
        },
      },
      markers: {
        size: 5,
      },
      xaxis: {
        type: 'datetime',
        categories: [],
        tickAmount: 6,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        tickAmount: 4,
        floating: false,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      apexTooltip: {
        x: {
          format: 'dd MMM yyyy',
        },
      },
    };
  }
  ngOnInit(): void {
  }
  
  updateChartData(newChartData: ChartData[], newCategories: string[]): void {
    this.chartData = newChartData;
    this.categories = newCategories;
    this.chartOptions.series = this.chartData;
    this.chartOptions.xaxis.categories = this.categories;
    this.chart.updateOptions(this.chartOptions);
    this.changeDetectorRef.detectChanges();
  }
}
