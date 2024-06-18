import { Component, Input, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexGrid,
  ChartComponent,
  ApexMarkers,
  ApexYAxis,
  ApexTooltip,
} from 'ng-apexcharts';

export interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  markers: ApexMarkers;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  apexTooltip: ApexTooltip;
  colors?: any;
}

@Component({
  selector: 'app-dash-chart',
  templateUrl: './dash-chart.component.html',
  styleUrls: ['./dash-chart.component.scss']
})
export class DashChartComponent implements AfterViewInit {
  @Input() chartId: string = 'myChart';
  @Input() chartTitle: string = 'Chart';
  @Input() showLoader:boolean = false;
  chartOptions: ChartOptions;

  @Input() data: any;

  @ViewChild(ChartComponent,{ static: false }) chart!: ChartComponent;
  

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    this.chartOptions = {
      series: [
        {
          name: 'visit',
          data: [],
        }
      ],
      chart: {
        height: 350,
        type: 'area',
  
        zoom: {
          enabled: false
        }
      },
      colors: ['#9752FC ', '#00E396', '#CED4DC'],
      dataLabels: {
        enabled: false,

      },
      stroke: {
        curve: "smooth",
        width:1
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        }
      },
      markers: {
        size: 5,
      },
      xaxis: {
        type:'datetime',
        categories: [],
        tickAmount: 6,
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },      
      yaxis: {
        tickAmount: 4,
        floating: false,
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      apexTooltip:{
        x: {
          format: "dd MMM yyyy"
        }
      }
    };
  }

  ngAfterViewInit() {
    setTimeout(()=>this.updateChart(this.data, this.data.lables), 100)
  }

  updateChart = (data: any, labels: any) => {
    if (data && data.values && labels && labels.length > 0) {      
      if (this.chart) {
        this.chart.updateOptions({
          series: [{ ...this.chartOptions.series[0], data: data.values, name: data.name,color: '#9752FC' }],
          xaxis: { ...this.chartOptions.xaxis, categories: labels }
        });
        this.changeDetectorRef.detectChanges()
      }
    } else {
      console.log(labels);     
      console.error('Data or labels are null or empty.');
    }
  }
  
}
