import React, { useEffect } from 'react';
import { Chart } from 'react-google-charts';

const GoogleBarChart = ({ a1Count, b2Count, c3Count }) => {
  const data = [
    ["Category", "Count"],
    ["A1", a1Count],
    ["B2", b2Count],
    ["C3", c3Count],
  ];

  const options = {
    title: '',
    backgroundColor: 'transparent',
    colors: ['#8458f8'],
    legend: { position: 'none' },
    vAxis: {
      gridlines: { color: '#b1a8d7', count: 9 },
      minValue: 0,
      maxValue:10,
      format: '#',
      textStyle: { 
        color: '#7669b5',
        fontSize: 14,
        bold: true,
        fontWeight: '600',
      }
    },
    hAxis: {
      textStyle: { 
        color: '#7669b5',
        fontSize: 14,
        bold: true,
        fontWeight: '600',
      },
      gridlines: {
        color: '#7669b5',
        count: 1,
        lineWidth: 5,
      },
      baselineColor: '#7669b5',
      baselineWidth: 5,
    },
    bar: { groupWidth: '50%' },
    chartArea: { width: '90%', height: '80%' }
  };

  return (
    <div className="w-full p-4">
      <Chart
        chartType="ColumnChart"
        data={data}
        options={options}
        width="100%"
        height="400px"
      />
    </div>
  );
};

export default GoogleBarChart;