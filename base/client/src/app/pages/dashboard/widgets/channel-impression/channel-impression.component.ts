import { Component, ViewChild } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexYAxis,
  ApexTooltip,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexPlotOptions,
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  title: ApexTitleSubtitle;
  labels: string[];
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-channel-impression',
  templateUrl: './channel-impression.component.html',
  styleUrls: ['./channel-impression.component.scss']
})
export class ChannelImpressionComponent {
  @ViewChild("chart") chart: ChartComponent | undefined;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "Channels",
          type: "column",
          data: [100, 200, 300, 400, 500],
          color: "#444444",
        },
        {
          name: "Pipeline Value",
          type: "line",
          data: [50, 20, 77, 90, 40],
          color: '#DDDDDD' 
        },
      ],
      chart: {
        height: 350, // Increase the height of the chart
        type: "line",
      },
      stroke: {
        width: [0, 4],
      },
      title: {
        text: "CHANNELS IMPRESSIONS & PIPELINE VALUE GENERATED",
        align: 'center',
        style: {
          fontSize: '14px', // Adjust the font size of the title
          fontWeight: 'semibold', // Remove bold styling
        },
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [1],
        style: {
          fontSize: '12px', // Adjust the font size of data labels
        },
        formatter: function (value: number) {
          return `$${value}`;
        },
      },
      labels: ["Google", "LinkedIn", "Facebook", "Instagram", "Others"],
      xaxis: {
        type: "category",
        labels: {
          style: {
            fontSize: '14px', // Adjust the font size of x-axis labels
          },
        },
      },
      yaxis: [
        {
          title: {
            text: "Impression",
            style: {
              fontSize: '14px', // Adjust the font size of y-axis title
            },
          },
          labels: {
            style: {
              fontSize: '12px', // Adjust the font size of y-axis labels
            },
            formatter: function (value: number) {
              return `${value}`;
            },
          },
        },
        {
          opposite: true,
          title: {
            text: "Pipeline Value",
            style: {
              fontSize: '14px', // Adjust the font size of y-axis title
            },
          },
          labels: {
            style: {
              fontSize: '12px', // Adjust the font size of y-axis labels
            },
            formatter: function (value: number) {
              return `$${value}`;
            },
          },
        },
      ],
      fill: {
        type: 'solid'
      },
      tooltip: {
        shared: true,
        intersect: false,
        style: {
          fontSize: '12px', // Adjust the font size of the tooltip
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '70px',
        }
      }
    };
  }
}
