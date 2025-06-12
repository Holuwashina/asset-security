import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from 'next/dynamic';
import { Brain, Computer, GitBranch, TrendingUp, BarChart3, PieChart, Activity, AlertTriangle } from "lucide-react";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ModelComparisonChartProps {
  metrics: any[];
  title: string;
  subtitle: string;
}

const ModelComparisonChart: React.FC<ModelComparisonChartProps> = ({ metrics, title, subtitle }) => {
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [chartType, setChartType] = useState('bar');

  // Only use real API data - no defaults
  const data = metrics || [];
  
  // If no data available, show message
  if (!data || data.length === 0) {
    return (
      <Card className="border rounded-xl shadow-lg bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {subtitle}
              </p>
            </div>
            <Badge className="bg-gray-400 text-white">
              <AlertTriangle className="h-3 w-3 mr-1" />
              No Data Available
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Performance Data Available</h3>
            <p className="text-gray-500 mb-4">
              Model comparison data will appear here once assets have been processed through the classification framework.
            </p>
            <p className="text-sm text-gray-400">
              Complete asset classification and model comparison to see performance metrics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Prepare chart data from real API data
  const categories = data.map(item => item.approach?.replace('Modern ', '').replace('Traditional ', '') || 'Unknown');

  // Dynamic chart options based on chart type and selected metric
  const getChartOptions = () => {
    const baseOptions: any = {
      chart: {
        type: chartType as 'bar' | 'line' | 'pie' | 'radar',
        fontFamily: "'Inter', sans-serif",
        foreColor: '#6b7280',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        background: 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      colors: [
        '#3b82f6',  // Blue
        '#10b981',  // Green
        '#06b6d4',  // Cyan
        '#f59e0b',  // Orange
        '#8b5cf6',  // Purple
        '#ef4444',  // Red
        '#06b6d4',  // Cyan
        '#84cc16'   // Lime
      ],
      stroke: {
        curve: 'smooth',
        width: chartType === 'line' ? 3 : 0
      },
      markers: {
        size: chartType === 'line' ? 6 : 0,
        hover: {
          size: 8
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '75%',
          grouped: true,
          dataLabels: {
            position: 'top',
          },
          distributed: false
        },
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Average',
                formatter: function (w: any) {
                  const sum = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                  return (sum / w.globals.seriesTotals.length).toFixed(1) + '%';
                }
              }
            }
          }
        },
        radar: {
          size: 140,
          polygons: {
            strokeColors: '#e5e7eb',
            fill: {
              colors: ['#f8fafc', '#f1f5f9']
            }
          }
        }
      },
      dataLabels: {
        enabled: chartType === 'bar' && selectedMetric !== 'all',
        offsetY: -25,
        style: {
          fontSize: '11px',
          fontWeight: '600',
          colors: ['#374151']
        },
        formatter: function(val: number) {
          return val.toFixed(0) + (selectedMetric.includes('time') ? 'ms' : selectedMetric.includes('memory') ? 'MB' : '%');
        },
        background: {
          enabled: true,
          foreColor: '#fff',
          padding: 4,
          borderRadius: 2,
          borderWidth: 1,
          borderColor: '#fff',
          opacity: 0.9,
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
          },
          formatter: function(val: number) {
            return val.toFixed(0) + (selectedMetric.includes('time') ? 'ms' : selectedMetric.includes('memory') ? 'MB' : '%');
          }
        },
        title: {
          text: selectedMetric.includes('time') ? 'Processing Time (ms)' : selectedMetric.includes('memory') ? 'Memory Usage (MB)' : 'Performance (%)',
          style: {
            color: '#6b7280',
            fontSize: '13px',
            fontWeight: 500,
          }
        },
        min: 0,
        max: selectedMetric.includes('time') ? 150 : selectedMetric.includes('memory') ? 100 : 100
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
          top: 20,
          right: 20,
          bottom: 10,
          left: 10,
        },
      },
      legend: {
        show: true,
        position: 'top' as const,
        horizontalAlign: 'center' as const,
        fontSize: '12px',
        fontWeight: 500,
        labels: {
          colors: '#374151',
        },
        markers: {
          width: 12,
          height: 12,
          radius: 6,
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
            return val.toFixed(1) + (selectedMetric.includes('time') ? 'ms' : selectedMetric.includes('memory') ? 'MB' : '%');
          }
        }
      }
    };

    return baseOptions;
  };

  // Dynamic series based on selected metric and chart type - only use real API data
  const getSeries = () => {
    if (chartType === 'pie') {
      return data.map(item => {
        const value = selectedMetric === 'accuracy' ? (item.accuracy || 0) * 100 :
                     selectedMetric === 'precision' ? (item.precision || 0) * 100 :
                     selectedMetric === 'recall' ? (item.recall || 0) * 100 :
                     selectedMetric === 'f1_score' ? (item.f1_score || 0) * 100 :
                     selectedMetric === 'processing_time' ? (item.processing_time || 0) :
                     selectedMetric === 'memory_usage' ? (item.memory_usage || 0) :
                     selectedMetric === 'scalability' ? (item.scalability || 0) * 100 :
                     (item.interpretability || 0) * 100;
        return parseFloat(value.toFixed(1));
      });
    }

    if (selectedMetric === 'all') {
      return [
        {
          name: 'Accuracy',
          data: data.map(item => parseFloat(((item.accuracy || 0) * 100).toFixed(1)))
        },
        {
          name: 'Precision',
          data: data.map(item => parseFloat(((item.precision || 0) * 100).toFixed(1)))
        },
        {
          name: 'Recall',
          data: data.map(item => parseFloat(((item.recall || 0) * 100).toFixed(1)))
        },
        {
          name: 'F1-Score',
          data: data.map(item => parseFloat(((item.f1_score || 0) * 100).toFixed(1)))
        }
      ];
    }

    // Single metric
    const metricName = selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1).replace('_', ' ');
    return [{
      name: metricName,
      data: data.map(item => {
        const value = selectedMetric === 'accuracy' ? (item.accuracy || 0) * 100 :
                     selectedMetric === 'precision' ? (item.precision || 0) * 100 :
                     selectedMetric === 'recall' ? (item.recall || 0) * 100 :
                     selectedMetric === 'f1_score' ? (item.f1_score || 0) * 100 :
                     selectedMetric === 'processing_time' ? (item.processing_time || 0) :
                     selectedMetric === 'memory_usage' ? (item.memory_usage || 0) :
                     selectedMetric === 'scalability' ? (item.scalability || 0) * 100 :
                     (item.interpretability || 0) * 100;
        return parseFloat(value.toFixed(1));
      })
    }];
  };

  // Radar chart for comprehensive comparison - only real API data
  const getRadarSeries = () => {
    return data.map(item => ({
      name: item.approach || 'Unknown',
      data: [
        (item.accuracy || 0) * 100,
        (item.precision || 0) * 100,
        (item.recall || 0) * 100,
        (item.f1_score || 0) * 100,
        (item.scalability || 0) * 100,
        (item.interpretability || 0) * 100
      ]
    }));
  };

  const radarOptions: any = {
    chart: {
      type: 'radar' as const,
      fontFamily: "'Inter', sans-serif",
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b'],
    xaxis: {
      categories: ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'Scalability', 'Interpretability']
    },
    yaxis: {
      show: false,
      min: 0,
      max: 100
    },
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColors: '#e5e7eb',
          fill: {
            colors: ['#f8fafc', '#f1f5f9']
          }
        }
      }
    },
    legend: {
      show: true,
      position: 'bottom' as const,
    },
    tooltip: {
      y: {
        formatter: function(val: number) {
          return val.toFixed(1) + '%';
        }
      }
    }
  };

  const getModelIcon = (approach: string) => {
    if (approach?.includes('Fuzzy')) return <Brain className="h-3 w-3" />;
    if (approach?.includes('SVM')) return <Computer className="h-3 w-3" />;
    return <GitBranch className="h-3 w-3" />;
  };

  const getModelVariant = (approach: string): "default" | "secondary" | "destructive" | "outline" => {
    if (approach?.includes('Fuzzy')) return 'default';
    if (approach?.includes('SVM')) return 'secondary';
    return 'outline';
  };

  const chartOptions = getChartOptions();
  const series = getSeries();

  return (
    <Card className="border rounded-xl shadow-lg bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-1">
              {title}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            Live API Data
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Interactive Controls */}
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Comparison</span>
            </TabsTrigger>
            <TabsTrigger value="radar" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Radar View</span>
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center space-x-2">
              <PieChart className="h-4 w-4" />
              <span>Detailed</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-4">
            {/* Metric Selection */}
            <div className="flex flex-wrap gap-2 mb-4">
              <p className="text-sm font-medium text-gray-700 mr-2">Select Metric:</p>
              {['all', 'accuracy', 'precision', 'recall', 'f1_score'].map((metric) => (
                <Button
                  key={metric}
                  variant={selectedMetric === metric ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMetric(metric)}
                  className="text-xs"
                >
                  {metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Button>
              ))}
            </div>

            {/* Chart Type Selection */}
            <div className="flex gap-2 mb-4">
              <p className="text-sm font-medium text-gray-700 mr-2">Chart Type:</p>
              {['bar', 'line', 'pie'].map((type) => (
                <Button
                  key={type}
                  variant={chartType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType(type)}
                  className="text-xs"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>

            {/* Model Comparison Tags */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {data.map((model, index) => (
                <Badge
                  key={index}
                  variant={getModelVariant(model.approach)}
                  className="flex items-center gap-1"
                >
                  {getModelIcon(model.approach)}
                  {model.approach || `Model ${index + 1}`}
                </Badge>
              ))}
            </div>
            
            <div className="h-[450px] flex items-center justify-center bg-white/50 rounded-lg border p-4">
              <Chart
                options={chartOptions}
                series={chartType === 'pie' ? series : series}
                type={chartType as any}
                height={400}
                width="100%"
              />
            </div>
          </TabsContent>

          <TabsContent value="radar" className="space-y-4">
            <div className="h-[400px] flex items-center justify-center bg-white/50 rounded-lg border">
              <Chart
                options={radarOptions}
                series={getRadarSeries()}
                type="radar"
                height={380}
                width="100%"
              />
            </div>
            <div className="text-center text-sm text-gray-600">
              Comprehensive performance comparison across all metrics (Live API Data)
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            {/* Detailed Performance Metrics - Real API Data Only */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.map((model, index) => (
                <Card key={index} className="bg-white/60 border-2 hover:border-blue-300 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getModelIcon(model.approach)}
                      {model.approach || `Model ${index + 1}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Accuracy:</span>
                        <div className="font-semibold">{((model.accuracy || 0) * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Precision:</span>
                        <div className="font-semibold">{((model.precision || 0) * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Recall:</span>
                        <div className="font-semibold">{((model.recall || 0) * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">F1-Score:</span>
                        <div className="font-semibold">{((model.f1_score || 0) * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Performance Summary</h4>
              <p className="text-sm text-blue-800">
                Displaying real-time performance metrics from API data. 
                Models are evaluated based on accuracy, precision, recall, and F1-score metrics 
                derived from actual classification results.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ModelComparisonChart;