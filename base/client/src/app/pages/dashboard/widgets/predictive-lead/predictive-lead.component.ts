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
export class PredictiveLeadComponent implements OnChanges{
  @Input() predictiveLeadScores: any;
  @ViewChild("chart") chart: ChartComponent | undefined;
  isNull : boolean = false;
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
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      title: {
        text: "PREDICTIVE LEAD SCORING",
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'normal' // Adjust font size if needed
        }
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
        }
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
        show: false // Disable the built-in legend
      }
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['predictiveLeadScores'] && changes['predictiveLeadScores'].currentValue) {
      this.updateChartOptions();
    }
  }

  updateChartOptions(): void {   
    this.isNull = this.predictiveLeadScores.every((score: number) => score === 0);
    if (this.isNull) {
      this.chartOptions.series = [];
    } else {
      this.chartOptions.series = this.predictiveLeadScores;
    }  }
}
