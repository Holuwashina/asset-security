import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ClassificationOverviewProps {
  data: Record<string, number>;
  title: string;
}

const ClassificationOverview: React.FC<ClassificationOverviewProps> = ({ data, title }) => {
  // Prepare chart data
  const categories = Object.keys(data);
  const values = Object.values(data);
  const total = values.reduce((sum, val) => sum + val, 0);

  const chartOptions = {
    chart: {
      type: 'bar' as const,
      fontFamily: "'Inter', sans-serif",
      foreColor: '#6b7280',
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: ['#3b82f6'],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
        distributed: false,
        dataLabels: {
          position: 'top',
        }
      }
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#374151']
      }
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
          fontWeight: 500,
        }
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        }
      },
      title: {
        text: 'Number of Assets',
        style: {
          color: '#6b7280',
          fontSize: '13px',
          fontWeight: 500,
        }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        }
      },
      yaxis: {
        lines: {
          show: true,
        }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: "'Inter', sans-serif",
      },
      y: {
        formatter: function(val: number) {
          return val + ' assets';
        }
      }
    }
  };

  const series = [{
    name: 'Assets',
    data: values
  }];

  return (
    <Card className="h-full border rounded-xl shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-6 text-gray-900">
          {title}
        </h3>
        
        {total > 0 ? (
          <div className="h-[350px]">
            <Chart
              options={chartOptions}
              series={series}
              type="bar"
              height={320}
              width="100%"
            />
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
            <h4 className="text-lg font-semibold mb-2">
              No Classification Data
            </h4>
            <p className="text-sm">
              Start classifying assets to see distribution
            </p>
          </div>
        )}
        
        {/* Summary Stats */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-600 mb-2">
            Classification Summary
          </p>
          <div className="flex justify-between flex-wrap gap-2">
            {categories.map((category, index) => (
              <div key={category} className="text-center min-w-[80px]">
                <p className="text-lg font-bold text-blue-600">
                  {values[index]}
                </p>
                <p className="text-xs text-gray-500">
                  {category}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassificationOverview;