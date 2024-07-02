import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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
export class ChannelImpressionComponent implements OnChanges{
  @ViewChild("chart") chart: ChartComponent | undefined;
  @Input() pipelineValue :any;
  isNull : boolean = true;
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
        text: "CHANNELS IMPRESSIONS & PIPELINE VALUE ",
        align: 'center',
        style: {
          fontSize: '18px', // Adjust the font size of the title
          fontWeight: 'bold', // Adjust the font weight of the title
          fontFamily: 'Mulish, sans-serif', // Adjust the font family of the title
        },
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [1],
        style: {
          fontFamily: 'Mulish, sans-serif', // Adjust the font family of the title
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
            fontFamily: 'Mulish, sans-serif', // Adjust the font family of the title
            fontSize: '14px', // Adjust the font size of x-axis labels
          },
        },
      },
      yaxis: [
        {
          title: {
            text: "Impression",
            style: {
              fontFamily: 'Mulish, sans-serif', // Adjust the font family of the title
              fontSize: '14px', // Adjust the font size of y-axis title
            },
          },
          labels: {
            style: {
              fontFamily: 'Mulish, sans-serif', // Adjust the font family of the title
              fontSize: '14px', // Adjust the font size of y-axis labels
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
              fontFamily: 'Mulish, sans-serif', // Adjust the font family of the title
              fontSize: '14px', // Adjust the font size of y-axis title
            },
          },
          labels: {
            style: {
              fontFamily: 'Mulish, sans-serif', // Adjust the font family of the title
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
          fontFamily: 'Mulish, sans-serif', // Adjust the font family of the title
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
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pipelineValue'] && changes['pipelineValue'].currentValue) {
      this.isNull =true
      this.updateChartOptions();
    }
  }

  updateChartOptions() {
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: "Channels",
          type: "column",
          data: this.pipelineValue?.column || [],
          color: "#444444",
        },
        {
          name: "Pipeline Value",
          type: "line",
          data: this.pipelineValue?.line || [],
          color: '#DDDDDD'
        },
      ],
      labels: this.pipelineValue?.labels ? this.titleCase(this.pipelineValue?.labels) : [],
    };
    if(this.pipelineValue?.column?.length > 0 || this.pipelineValue?.line?.length > 0){
      this.isNull = false;
    }
  }

  titleCase(labels: string[]): string[] {
    return labels.map(label => {
      return label.toLowerCase().replace(/\b\w/g, firstChar => firstChar.toUpperCase());
    });
  }
  
}
