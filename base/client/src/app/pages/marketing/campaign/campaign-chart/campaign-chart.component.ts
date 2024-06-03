import { Component, Input, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ChartComponent,
  ApexMarkers,
  ApexPlotOptions,
} from 'ng-apexcharts';

export interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  markers: ApexMarkers;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  colors?: any;
  plotOptions: ApexPlotOptions;
}

@Component({
  selector: 'app-campaign-chart',
  templateUrl: './campaign-chart.component.html',
  styleUrls: ['./campaign-chart.component.scss']
})
export class CampaignChartComponent implements AfterViewInit
{
  @Input() type: any = 'line';
  @Input() chartId: string = 'myChart';
  @Input() chartTitle: string = 'Chart';
  @Input() chartOptions!: ChartOptions;

  @ViewChild(ChartComponent,{ static: false }) chart!: ChartComponent;
  

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    this.chartOptions = {
      series: [
        {
          name: 'visit',
          data: []
        }
      ],
      chart: {
        height: 350,
        type: this.type,
  
        zoom: {
          enabled: false
        }
      },
      colors: ['#9752FC ', '#00E396', '#CED4DC'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth",
        width:1
      },
      title: {
        text: this.chartTitle,
        align: 'left'
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
        type:'category',
        categories: [],
      }, 
      plotOptions: {
        bar: {
          columnWidth: '20%'
        }
      }     
    };
  }

  ngAfterViewInit() {
  }

  updateChart(data:any, lables: any) {
    this.chartOptions.chart.type = this.type;
    this.chartOptions.series[0].data = data.values;
    this.chartOptions.series[0].name = data.name;
    this.chartOptions.xaxis.categories = lables;
    this.chartOptions.title.text = this.chartTitle;
    console.log(this.chart);
    if (this.chart) {
      this.chart.updateOptions(this.chartOptions);
      this.changeDetectorRef.detectChanges(); 
    }
  }

}
