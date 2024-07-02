import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexLegend
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  title: ApexTitleSubtitle;
  colors: string[];
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
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
  isNull: boolean = false;

  constructor() {
    this.chartOptions = {
      series: [],
      chart: {
        type: 'donut',
        height: 270,
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
        text: 'INTENT SCORING',
        offsetX:100,
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
          fontFamily: 'Mulish, sans-serif',
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontWeight: 'normal',
          fontFamily: 'Mulish, sans-serif',
          colors: ['#000']
        },
        dropShadow: {
          enabled: false,
        },
        formatter: function (val: number) {
          return Number(val).toFixed(1) + "%";
        }
      },
      legend: {
        position: 'right',
        offsetY: 80, // Adjust this to center vertically
        offsetX: 0, // Adjust this to fine-tune the horizontal position
        horizontalAlign: 'center',
        markers: {
          width: 10,
          height: 10,
          radius: 5,
        },
        itemMargin: {
          horizontal: 5,
          vertical: 2
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
    this.isNull = this.intentScores.every((score: number) => score === 0);
    if (this.isNull) {
      this.chartOptions.series = [];
    } else {
      this.chartOptions.series = this.intentScores;
    }
  }
}
