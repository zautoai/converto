import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexTitleSubtitle,
  ApexDataLabels
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  title: ApexTitleSubtitle;
  colors: string[];
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-scoring-intent',
  templateUrl: './scoring-intent.component.html',
  styleUrls: ['./scoring-intent.component.scss']
})
export class ScoringIntentComponent implements OnChanges {
  @Input() intentScores: any;
  @ViewChild('chart') chart: ChartComponent | undefined;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = {
      series: [],
      chart: {
        type: 'donut',
        height: 250, // Set the chart's height directly
        toolbar: {
          show: false
        }
      },
      labels: ['High', 'Medium', 'Low'],
      colors: ['#DDDDDD', '#BAF2BC', '#F8D6D3'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
      title: {
        text: 'Intent Scoring',
        align: 'center', // Align the title to the left
        style: {
          fontSize: '18px',
          fontWeight: 'normal'
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'normal',
          colors: ['#000']
        },
        dropShadow: {
          enabled: false,
        },
        formatter: function (val: number) {
          return Number(val).toFixed(1) + "%";
        }
      }
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['intentScores'] && changes['intentScores'].currentValue) {
      this.updateChartOptions();
    }
  }

  updateChartOptions(): void {
    this.chartOptions.series = this.intentScores;
  }
}
