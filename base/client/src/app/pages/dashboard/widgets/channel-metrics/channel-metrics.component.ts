import { Component, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip?: ApexTooltip;
};

@Component({
  selector: 'app-channel-metrics',
  templateUrl: './channel-metrics.component.html',
  styleUrls: ['./channel-metrics.component.scss']
})
export class ChannelMetricsComponent {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "First Touch",
          data: [60, 30, 57, 69, 40],
          color: "#444444" // Set the color for First Touch
        },
        {
          name: "Last Touch",
          data: [40, 55, 78, 50, 80],
          color: "#DDDDDD" // Set the color for Last Touch
        },
      ],
      chart: {
        type: "bar",
        height: 430,
      },
      title: {
        text: "CHANNEL ENHANCEMENT METRICS",
        align: "center",
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        offsetX: -6,
        style: {
          fontSize: "12px",
          colors: ["#fff"],
        },
        formatter: function (val) {
          return val + "%";
        },
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["#fff"],
      },
      xaxis: {
        categories: ["Google", "LinkedIn", "Facebook", "Instagram", "Others"],
        labels: {
          style: {
            fontSize: '10px', // Increase the font size of x-axis categories
          }
        }
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: function (val) {
            return val + "%";
                    },
        },
      },
    };
  }
}
