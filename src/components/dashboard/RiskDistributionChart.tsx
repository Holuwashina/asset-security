import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RiskDistributionChartProps {
  data: Record<string, number>;
  title: string;
}

const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ data, title }) => {
  // Prepare chart data
  const categories = Object.keys(data);
  const values = Object.values(data);
  const total = values.reduce((sum, val) => sum + val, 0);

  const chartOptions = {
    chart: {
      type: 'donut' as const,
      fontFamily: "'Inter', sans-serif",
      foreColor: '#6b7280',
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: [
      '#10b981',  // Low - green
      '#3b82f6',  // Medium - blue  
      '#f59e0b',  // High - orange
      '#ef4444',  // Very High - red
      '#9ca3af',  // Unknown - gray
    ],
    labels: categories,
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#374151',
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total Assets',
              fontSize: '14px',
              fontWeight: 600,
              color: '#6b7280',
              formatter: () => total.toString(),
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#fff']
      },
      formatter: function(val: number) {
        return Math.round(val) + '%';
      }
    },
    legend: {
      show: true,
      position: 'bottom' as const,
      horizontalAlign: 'center' as const,
      fontSize: '13px',
      fontWeight: 500,
      labels: {
        colors: '#374151',
      },
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      }
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
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
            height: 300
          },
          legend: {
            position: 'bottom' as const
          }
        }
      }
    ]
  };

  return (
    <Card className="h-full border rounded-xl shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-6 text-gray-900">
          {title}
        </h3>
        
        {total > 0 ? (
          <div className="h-[350px] flex items-center justify-center">
            <Chart
              options={chartOptions}
              series={values}
              type="donut"
              height={320}
              width="100%"
            />
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
            <h4 className="text-lg font-semibold mb-2">
              No Risk Data
            </h4>
            <p className="text-sm">
              Start analyzing assets to see risk distribution
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskDistributionChart;