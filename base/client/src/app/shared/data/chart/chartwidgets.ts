import { ChartConfiguration, ChartData, ChartType } from "chart.js";

export let ApexData1 : any = {
  series: [{
    data: [28, 56, 36, 32, 48, 54, 37, 58, 66, 53, 21, 24, 14, 45, 0, 32, 67, 49, 52, 55, 46, 54, 130],
    color: '#ec82ef',
  }],
  chart: {
    type: 'line',
    width: 100,
    height: 60,
    sparkline: {
      enabled: true
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: 3,
    curve: 'smooth',
  },
  tooltip: {
    enabled: false,
    marker: {
      show: false
    },
  }
};

export let ApexData2 : any = {
  chart: {
    type: 'line',
    width: 100,
    height: 60,
    sparkline: {
      enabled: true
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: 3,
    curve: 'smooth',
  },
  tooltip: {
    enabled: false,
    marker: {
      show: false
    },
  },
    series: [{
      data: [45, 23, 32, 67, 49, 72, 52, 55, 46, 54, 32, 74, 88, 36, 36, 32, 48, 54],
      color: '#F7B731',
    }],

  };

export let ApexData3 : any = {
  chart: {
    type: 'area',
    height: 60,
    width: 160,
    sparkline: {
      enabled: true,
    },
    dropShadow: {
      enabled: true,
      blur: 3,
      opacity: 0.2,
    },
  },
  stroke: {
    show: true,
    curve: 'smooth',
    lineCap: 'butt',
    colors: undefined,
    width: 2,
    dashArray: 0,
  },
  fill: {
    gradient: {
      enabled: false,
    },
  },
  series: [
    {
      name: 'Expenses',
      data: [
        0, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46, 45, 54, 38, 56, 24,
        65, 31, 37, 39, 62, 51,
      ],
    },
  ],
  yaxis: {
    min: 0,
  },
  colors: ['#ff5b51'],
};


export let ApexSparklines1 = {
  series: [
    {
          type: 'column',
          data: [19, 15, 17, 14, 13, 15, 16],
          color: '#05c3fb',
    }
  ],
  chart: {

    sparkline: {
      enabled: true
    },
    stacked: false,
    height: 60,
    width:100
  },
  plotOptions: {
    bar: {
      borderRadius: 1,
      columnWidth: '45',
      horizontal: false,
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: false,
    width: 7,
    colors: ["transparent"]
  },
  xaxis: {
    categories: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
  },
  tooltip: {
    enabled: false,
    }
  }

export let ApexSparklines2 = {
  series: [
    {
      data: [
        3, 5, 4, 4, 5, 4, 5, 3, 4, 5, 3, 4, 5, 4, 3, 5, 4, 3, 4, 5, 4, 5, 4, 3,
        5, 4, 3, 4, 5,
      ],
    },
  ],
  colors: ['#f7346b'],
  chart: {
    type: 'bar',
    widht: 250,
    height: 50,
    sparkline: {
      enabled: true,
    },
  },
  plotOptions: {
    bar: {
      columnWidth: '35%',
    },
  },

  tooltip: {
    fixed: {
      enabled: false,
    },
    x: {
      show: false,
    },
    y: {
      title: {
        formatter: function (seriesName: any) {
          return '';
        },
      },
    },
    marker: {
      show: true,
    },
  },
};

export let ApexSparklines3 = {
  series: [
    {
          type: 'column',
          data: [14, 17, 12, 13, 11, 15, 16],
          color: '#4ecc48',
    }
  ],
  chart: {

    sparkline: {
      enabled: true
    },
    stacked: false,
    height: 60,
    width:100
  },
  plotOptions: {
    bar: {
      borderRadius: 1,
      columnWidth: '45',
      horizontal: false,
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: false,
    width: 7,
    colors: ["transparent"]
  },
  xaxis: {
    categories: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
  },
  tooltip: {
    enabled: false,
    }
};

export let ApexSparklines4 = {

  series: [
        {
          data: [27, 50, 28, 50, 28, 30, 22],
          color: '#05c3fb'
        },
        {
          data: [32, 58, 68, 65, 40, 68, 58],
          color: '#ec82ef'
        }
      ],
      chart: {
        type: "bar",
        height: 225,
        sparkline: {
          enabled: true
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '30',
          horizontal: false,
        }
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["#fff"]
      },
      xaxis: {
        categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      }
    }

//Line Charts
export let lineChartOptions: ChartConfiguration['options'] = {
  maintainAspectRatio: false,
  responsive: true,
  plugins:{
    legend: {
      display: false,
      labels: {
        //display: false
      }
    },
  },
  scales: {
    y: {
      ticks: {
        // beginAtZero: true,
        // fontSize: 10,
        // max: 80,
        color: "rgba(171, 167, 167,0.9)",
      },
      grid: {
        display: true,
        color: 'rgba(171, 167, 167,0.2)',

      },
    },
    x: {
      ticks: {
        // beginAtZero: true,
        // fontSize: 11,
        color: "rgba(171, 167, 167,0.9)",
      },
      grid: {
        display: true,
        color: 'rgba(171, 167, 167,0.2)',

      },
    }
  },
};


export let lineChartType: ChartType = 'line';
export let lineChartLegend = true;
export let lineChartData: ChartConfiguration['data'] ={datasets: [

  {
    data: [450, 480, 420,500, 400, 350, 450, 580, 400, 350, 450, 354],
    borderColor: '#0052cc',
    borderWidth: 5,
    fill: false,
    tension: 0.4,
    pointRadius: 0,


  },
  {
    data: [300, 440, 300, 614, 500, 300, 400, 480, 350, 350, 450, 354],

    borderColor: '#0052cc26',
    backgroundColor: '#0052cc26',
    borderWidth: 5,
    fill: true,
    tension: 0.4,
    pointRadius: 0,
  },


],
labels:['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
}


