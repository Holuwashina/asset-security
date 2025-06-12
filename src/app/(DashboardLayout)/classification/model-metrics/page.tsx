"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bar, Line, Radar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
import { usePerformanceMetrics } from "@/lib/hooks/useAssets";
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Award,
  Loader2,
  AlertTriangle
} from "lucide-react";
import PageContainer from "@/components/common/PageContainer";

// Initialize Chart.js
ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

interface MetricData {
  id?: number;
  approach: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  training_time?: number;
  prediction_time?: number;
}

const ModelMetricsPage = () => {
  const { data: performanceMetrics, isLoading } = usePerformanceMetrics();

  // Default zero data when no API data is available
  const defaultMetrics: MetricData[] = [
    {
      id: 1,
      approach: "Traditional Fuzzy Logic",
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1_score: 0,
      training_time: 0,
      prediction_time: 0
    },
    {
      id: 2,
      approach: "Modern SVM",
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1_score: 0,
      training_time: 0,
      prediction_time: 0
    },
    {
      id: 3,
      approach: "Modern Decision Tree",
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1_score: 0,
      training_time: 0,
      prediction_time: 0
    }
  ];

  // Use API data if available, otherwise use zeros
  const metrics: MetricData[] = performanceMetrics && performanceMetrics.length > 0 ?
    performanceMetrics.map((metric: any, index: number) => ({
      id: index + 1,
      approach: metric.approach,
      accuracy: metric.accuracy || 0,
      precision: metric.precision || 0,
      recall: metric.recall || 0,
      f1_score: metric.f1_score || 0,
      training_time: metric.training_time || 0,
      prediction_time: metric.prediction_time || 0
    })) : defaultMetrics;

  // Find best performing model (handle all zeros case)
  const bestModel = metrics.reduce((prev: MetricData, current: MetricData) =>
    (prev.f1_score > current.f1_score) ? prev : current
  );

  // Check if we have any real data
  const hasRealData = metrics.some(m => m.accuracy > 0 || m.precision > 0 || m.recall > 0 || m.f1_score > 0);

  // Chart data for metrics comparison
  const metricsChartData = {
    labels: metrics.map((m: MetricData) => m.approach),
    datasets: [
      {
        label: 'Accuracy',
        data: metrics.map((m: MetricData) => m.accuracy),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Precision',
        data: metrics.map((m: MetricData) => m.precision),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
      {
        label: 'Recall',
        data: metrics.map((m: MetricData) => m.recall),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      },
      {
        label: 'F1-Score',
        data: metrics.map((m: MetricData) => m.f1_score),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Radar Chart for Multi-Metric Comparison
  const radarChartData = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
    datasets: metrics.map((metric: MetricData, index: number) => ({
      label: metric.approach,
      data: [metric.accuracy, metric.precision, metric.recall, metric.f1_score],
      backgroundColor: [
        'rgba(59, 130, 246, 0.2)',
        'rgba(16, 185, 129, 0.2)',
        'rgba(245, 158, 11, 0.2)'
      ][index],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)'
      ][index],
      borderWidth: 2,
      pointBackgroundColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)'
      ][index],
    }))
  };

  // F1-Score Distribution Pie Chart
  const f1ScoreDistribution = {
    labels: metrics.map((m: MetricData) => m.approach),
    datasets: [{
      data: metrics.map((m: MetricData) => m.f1_score),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)'
      ],
      borderWidth: 2,
    }]
  };

  // Line Chart for Metrics Trend
  const metricsLineData = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
    datasets: metrics.map((metric: MetricData, index: number) => ({
      label: metric.approach,
      data: [metric.accuracy, metric.precision, metric.recall, metric.f1_score],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)'
      ][index],
      backgroundColor: [
        'rgba(59, 130, 246, 0.1)',
        'rgba(16, 185, 129, 0.1)',
        'rgba(245, 158, 11, 0.1)'
      ][index],
      tension: 0.4,
      fill: true,
      pointRadius: 6,
      pointHoverRadius: 8,
    }))
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Multi-Dimensional Performance Comparison'
      },
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(value: any) {
            return (value * 100).toFixed(0) + '%';
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'F1-Score Distribution'
      },
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = (context.parsed * 100).toFixed(1);
            return `${label}: ${value}%`;
          }
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Performance Metrics Trend Analysis'
      },
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(value: any) {
            return (value * 100).toFixed(0) + '%';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    }
  };

  // Chart data for performance comparison
  const performanceChartData = {
    labels: metrics.map((m: MetricData) => m.approach),
    datasets: [
      {
        label: 'Training Time (seconds)',
        data: metrics.map((m: MetricData) => m.training_time || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Prediction Time (ms)',
        data: metrics.map((m: MetricData) => (m.prediction_time || 0) * 1000), // Convert to ms
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Model Performance Comparison'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(value: any) {
            return (value * 100).toFixed(0) + '%';
          }
        }
      }
    }
  };

  const performanceChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Training and Prediction Time Comparison',
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Models'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Training Time (seconds)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Prediction Time (ms)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const getModelIcon = (approach: string) => {
    if (approach.includes('Fuzzy')) return Zap;
    if (approach.includes('SVM')) return Brain;
    if (approach.includes('Decision')) return TrendingUp;
    return BarChart3;
  };

  const getPerformanceBadge = (score: number) => {
    if (score === 0) return { variant: 'secondary' as const, label: 'No Data' };
    if (score >= 0.9) return { variant: 'default' as const, label: 'Excellent' };
    if (score >= 0.85) return { variant: 'secondary' as const, label: 'Good' };
    if (score >= 0.8) return { variant: 'outline' as const, label: 'Fair' };
    return { variant: 'destructive' as const, label: 'Poor' };
  };

  if (isLoading) {
    return (
      <PageContainer title="Model Performance Metrics" description="Compare traditional and modern ML approaches">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Model Performance Metrics" description="Compare traditional and modern ML approaches for asset classification">
      <div className="space-y-6">
        
        {/* No Data Alert */}
        {!hasRealData && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">No Performance Data Available</p>
                  <p className="text-sm text-orange-600">
                    Complete asset classification and model comparison to generate performance metrics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Best Model Highlight */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              {hasRealData ? "Best Performing Model" : "Model Framework"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                {React.createElement(getModelIcon(bestModel.approach), { 
                  className: "h-8 w-8 text-yellow-600" 
                })}
                <div>
                  <h3 className="text-lg font-semibold">{bestModel.approach}</h3>
                  <p className="text-sm text-gray-600">
                    {hasRealData ? "Highest F1-Score Performance" : "Awaiting Performance Data"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">
                  {(bestModel.f1_score * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">F1-Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric: MetricData, index: number) => {
            const Icon = getModelIcon(metric.approach);
            const badge = getPerformanceBadge(metric.f1_score);
            
            return (
              <Card key={metric.id} className={bestModel.id === metric.id && hasRealData ? 'ring-2 ring-yellow-400' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {metric.approach}
                  </CardTitle>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Accuracy:</span>
                      <span className="font-medium">{(metric.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Precision:</span>
                      <span className="font-medium">{(metric.precision * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Recall:</span>
                      <span className="font-medium">{(metric.recall * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">F1-Score:</span>
                      <span className="font-bold">{(metric.f1_score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detailed Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Precision</TableHead>
                    <TableHead>Recall</TableHead>
                    <TableHead>F1-Score</TableHead>
                    <TableHead>Training Time (s)</TableHead>
                    <TableHead>Prediction Time (ms)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric: MetricData) => (
                    <TableRow key={metric.id} className={bestModel.id === metric.id && hasRealData ? 'bg-yellow-50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {React.createElement(getModelIcon(metric.approach), { className: "h-4 w-4" })}
                          {metric.approach}
                        </div>
                      </TableCell>
                      <TableCell>{(metric.accuracy * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(metric.precision * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(metric.recall * 100).toFixed(1)}%</TableCell>
                      <TableCell className="font-medium">{(metric.f1_score * 100).toFixed(1)}%</TableCell>
                      <TableCell>{metric.training_time?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{((metric.prediction_time || 0) * 1000).toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={metricsChartData} options={chartOptions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radar Chart Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Radar data={radarChartData} options={radarOptions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>F1-Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Doughnut data={f1ScoreDistribution} options={pieOptions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metrics Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={metricsLineData} options={lineOptions} />
            </CardContent>
          </Card>
        </div>

        {/* Training and Prediction Time Comparison */}
        {metrics.some(m => (m.training_time !== undefined && m.training_time > 0) || (m.prediction_time !== undefined && m.prediction_time > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Time Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={performanceChartData} options={performanceChartOptions} />
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default ModelMetricsPage;
