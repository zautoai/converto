import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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
export class ChannelMetricsComponent implements OnChanges {
  @Input() channelMetrics: any;
  @ViewChild("chart") chart!: ChartComponent;
  isNull: boolean = true;
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "First Touch",
          data: [],
          color: "#444444",
        },
        {
          name: "Last Touch",
          data: [],
          color: "#DDDDDD"
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
          fontFamily: 'Mulish, sans-serif', // Adjust the font family of the title
          fontSize: '14px',
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
        categories: [],
        labels: {
          style: {
            fontFamily: 'Mulish, sans-serif', // Adjust the font family of the title
            fontSize: '12px',
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelMetrics'] && changes['channelMetrics'].currentValue) {
      this.isNull = true
      this.updateChartOptions();
    }
  }

  updateChartOptions(): void {
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: "First Touch",
          data: this.channelMetrics?.firstTouchPointValues,
          color: "#444444"
        },
        {
          name: "Last Touch",
          data: this.channelMetrics?.lastTouchPointValues,
          color: "#DDDDDD"
        },
      ],
      xaxis: {
        categories: this.channelMetrics?.labels ? this.titleCase(this.channelMetrics?.labels) : [],
        labels: {
          style: {
            fontFamily: 'Mulish, sans-serif', // Adjust the font family of the title
            fontSize: '12px',
          }
        }
      }
    };
    if (this.channelMetrics?.firstTouchPointValues?.length > 0 || this.channelMetrics?.lastTouchPointValues?.length > 0) {
      this.isNull = false;
    }
  }
  titleCase(labels: string[]): string[] {
    return labels.map(label => {
      return label.toLowerCase().replace(/\b\w/g, firstChar => firstChar.toUpperCase());
    });
  }
}



