import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
  legend: ApexLegend;
};

@Component({
  selector: 'app-predictive-lead',
  templateUrl: './predictive-lead.component.html',
  styleUrls: ['./predictive-lead.component.scss']
})
export class PredictiveLeadComponent implements OnChanges {
  @Input() predictiveLeadScores: any;
  @ViewChild("chart") chart: ChartComponent | undefined;
  isNull: boolean = false;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = {
      series: [],
      chart: {
        width: 380,
        type: "pie",
      },
      labels: ["0-20", "20-40", "40-60", "60-80", "80-100"],
      colors: ['#A2E8F2', '#DDDDDD', '#BAF2BC', '#F8D6D3', '#FAD9F9'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
          },
        },
      ],
      title: {
        text: "PREDICTIVE LEAD SCORING",
        offsetX : 15,
        style: {
          fontSize: '18px',
          fontWeight: 'bolder',
          fontFamily: 'Mulish, sans-serif',
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          colors: ['#000']
        },
        dropShadow: {
          enabled: false,
        },
        formatter: function (val: number) {
          return Number(val).toFixed(1) + "%";
        },
      },
      plotOptions: {
        pie: {
          dataLabels: {
            offset: -10,
            minAngleToShowLabel: 10
          }
        }
      },
      legend: {
        position: 'right',
        offsetY: 75, // Adjust this to center vertically
        offsetX: -30, // Adjust this to fine-tune the horizontal position
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
      },
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['predictiveLeadScores'] && changes['predictiveLeadScores'].currentValue) {
      this.updateChartOptions();
    }
  }

  updateChartOptions(): void {
    this.isNull = this.predictiveLeadScores.every((score: number) => score === 0);
    if (this.isNull) {
      this.chartOptions.series = [];
    } else {
      this.chartOptions.series = this.predictiveLeadScores;
    }
  }
}
