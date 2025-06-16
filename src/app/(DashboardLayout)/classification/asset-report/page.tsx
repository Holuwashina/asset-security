"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssets, usePerformanceMetrics, Asset } from "@/lib/hooks/useAssets";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { 
  FileText, 
  Download, 
  Printer,
  Share2,
  BarChart3,
  PieChart,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Database,
  Activity,
  Loader2,
  RefreshCw
} from "lucide-react";
import PageContainer from "@/components/common/PageContainer";
import { toast } from "sonner";

// Initialize Chart.js
ChartJS.register(
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

const AssetClassificationReportPage = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Fetch data
  const { data: assetsData, isLoading, refetch } = useAssets();
  const { data: metricsData } = usePerformanceMetrics();

  const assets = assetsData?.results || [];

  // Calculate statistics
  const totalAssets = assets.length;
  const classifiedAssets = assets.filter((asset: Asset) => asset.classification).length;
  const riskAssessedAssets = assets.filter((asset: Asset) => asset.risk_index).length;
  const completedAssets = assets.filter((asset: Asset) =>
    asset.classification && asset.risk_index && asset.calculated_risk_level
  ).length;

  // Classification distribution
  const classificationCounts = assets.reduce((acc: any, asset: Asset) => {
    const classification = asset.classification || 'Unclassified';
    acc[classification] = (acc[classification] || 0) + 1;
    return acc;
  }, {});

  // Risk level distribution
  const riskLevelCounts = assets.reduce((acc: any, asset: Asset) => {
    const riskLevel = asset.mathematical_risk_category || 'Not Assessed';
    acc[riskLevel] = (acc[riskLevel] || 0) + 1;
    return acc;
  }, {});

  // Department distribution
  const departmentCounts = assets.reduce((acc: any, asset: Asset) => {
    const dept = asset.owner_department_name || 'Unknown';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // Asset type distribution
  const assetTypeCounts = assets.reduce((acc: any, asset: Asset) => {
    const type = asset.asset_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Chart data
  const classificationChartData = {
    labels: Object.keys(classificationCounts),
    datasets: [{
      data: Object.values(classificationCounts),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',   // High - Red
        'rgba(245, 158, 11, 0.8)',  // Medium - Orange
        'rgba(34, 197, 94, 0.8)',   // Low - Green
        'rgba(156, 163, 175, 0.8)'  // Unclassified - Gray
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(156, 163, 175, 1)'
      ],
      borderWidth: 2
    }]
  };

  const riskChartData = {
    labels: Object.keys(riskLevelCounts),
    datasets: [{
      data: Object.values(riskLevelCounts),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',   // High Risk - Red
        'rgba(245, 158, 11, 0.8)',  // Medium Risk - Orange
        'rgba(34, 197, 94, 0.8)',   // Low Risk - Green
        'rgba(156, 163, 175, 0.8)'  // Not Assessed - Gray
      ],
      borderWidth: 2
    }]
  };

  const departmentBarData = {
    labels: Object.keys(departmentCounts),
    datasets: [{
      label: 'Assets by Department',
      data: Object.values(departmentCounts),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const getClassificationBadgeVariant = (classification: string) => {
    // Handle Government Classification levels
    const cleanClassification = classification?.replace(/\s*\([0-9.]+\)$/, '').toLowerCase();
    
    switch (cleanClassification) {
      case 'restricted':
        return 'destructive';
      case 'confidential':
        return 'default';
      case 'official':
        return 'secondary';
      case 'public':
        return 'outline';
      default: 
        return 'outline';
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high risk': return 'destructive';
      case 'medium risk': return 'default';
      case 'low risk': return 'secondary';
      default: return 'outline';
    }
  };

  const handleExportReport = async (format: 'pdf' | 'excel') => {
    setIsGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleRefreshData = async () => {
    try {
      await refetch();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Classification Report" description="Comprehensive asset classification and risk assessment report">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Information Asset Classification Report" description="Comprehensive asset classification and risk assessment report">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefreshData}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrintReport}
              size="sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportReport('excel')}
              disabled={isGeneratingReport}
              size="sm"
            >
              {isGeneratingReport ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Excel
            </Button>
            <Button
              onClick={() => handleExportReport('pdf')}
              disabled={isGeneratingReport}
              size="sm"
            >
              {isGeneratingReport ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Export PDF
            </Button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold">{totalAssets}</p>
                  <p className="text-xs text-gray-500 mt-1">In inventory</p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Classified</p>
                  <p className="text-2xl font-bold">{classifiedAssets}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalAssets > 0 ? Math.round((classifiedAssets / totalAssets) * 100) : 0}% complete
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Risk Assessed</p>
                  <p className="text-2xl font-bold">{riskAssessedAssets}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalAssets > 0 ? Math.round((riskAssessedAssets / totalAssets) * 100) : 0}% complete
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fully Processed</p>
                  <p className="text-2xl font-bold">{completedAssets}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalAssets > 0 ? Math.round((completedAssets / totalAssets) * 100) : 0}% complete
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Executive Summary</TabsTrigger>
            <TabsTrigger value="classification">Classification Report</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          </TabsList>

          {/* Executive Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Classification Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut data={classificationChartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Assets by Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar data={departmentBarData} options={barChartOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Key Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Classification Status</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        {classifiedAssets} assets have been classified ({totalAssets > 0 ? Math.round((classifiedAssets / totalAssets) * 100) : 0}%)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        {riskAssessedAssets} assets have risk assessments ({totalAssets > 0 ? Math.round((riskAssessedAssets / totalAssets) * 100) : 0}%)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        {completedAssets} assets are fully processed ({totalAssets > 0 ? Math.round((completedAssets / totalAssets) * 100) : 0}%)
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Risk Profile</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        {riskLevelCounts['High Risk'] || 0} high-risk assets require immediate attention
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        {riskLevelCounts['Medium Risk'] || 0} medium-risk assets need monitoring
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        {riskLevelCounts['Low Risk'] || 0} low-risk assets are well protected
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classification Report Tab */}
          <TabsContent value="classification" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Classification Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(classificationCounts).map(([classification, count]) => (
                      <div key={classification} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant={getClassificationBadgeVariant(classification)}>
                            {classification}
                          </Badge>
                        </div>
                        <span className="font-semibold">{count as number} assets</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Asset Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(assetTypeCounts).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{type}</span>
                        <span className="font-semibold">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Classified Assets Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Classification</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.filter((asset: Asset) => asset.classification).map((asset: Asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.asset}</TableCell>
                          <TableCell>{asset.asset_type}</TableCell>
                          <TableCell>{asset.owner_department_name}</TableCell>
                          <TableCell>
                            <Badge variant={getClassificationBadgeVariant(asset.classification || '')}>
                              {asset.classification}
                            </Badge>
                          </TableCell>
                          <TableCell>{asset.classification_value?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Classified</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Risk Level Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut data={riskChartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Metrics Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-red-800">High Risk Assets</span>
                        <span className="text-2xl font-bold text-red-600">
                          {riskLevelCounts['High Risk'] || 0}
                        </span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">Require immediate attention</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-yellow-800">Medium Risk Assets</span>
                        <span className="text-2xl font-bold text-yellow-600">
                          {riskLevelCounts['Medium Risk'] || 0}
                        </span>
                      </div>
                      <p className="text-sm text-yellow-600 mt-1">Need regular monitoring</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-800">Low Risk Assets</span>
                        <span className="text-2xl font-bold text-green-600">
                          {riskLevelCounts['Low Risk'] || 0}
                        </span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">Well protected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Confidentiality</TableHead>
                        <TableHead>Integrity</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Risk Index</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Risk Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.filter((asset: Asset) => asset.risk_index).map((asset: Asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.asset}</TableCell>
                                          <TableCell>{asset.confidentiality ? asset.confidentiality.toFixed(2) : 'N/A'}</TableCell>
                <TableCell>{asset.integrity ? asset.integrity.toFixed(2) : 'N/A'}</TableCell>
                <TableCell>{asset.availability ? asset.availability.toFixed(2) : 'N/A'}</TableCell>
                          <TableCell>{asset.risk_index?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell>{asset.calculated_risk_level?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={getRiskBadgeVariant(asset.mathematical_risk_category || 'Not Assessed')}>
                              {asset.mathematical_risk_category || 'Not Assessed'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Analysis Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Asset Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Classification</TableHead>
                        <TableHead>Risk Category</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((asset: Asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.asset}</TableCell>
                          <TableCell>{asset.asset_type}</TableCell>
                          <TableCell>{asset.owner_department_name}</TableCell>
                          <TableCell>
                            {asset.classification ? (
                              <Badge variant={getClassificationBadgeVariant(asset.classification)}>
                                {asset.classification}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Unclassified</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {asset.mathematical_risk_category ? (
                              <Badge variant={getRiskBadgeVariant(asset.mathematical_risk_category)}>
                                {asset.mathematical_risk_category}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Assessed</Badge>
                            )}
                          </TableCell>
                          <TableCell>{asset.classification_value?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell>
                            {asset.classification && asset.risk_index && asset.calculated_risk_level ? (
                              <Badge variant="secondary">Complete</Badge>
                            ) : asset.classification ? (
                              <Badge variant="outline">Classified</Badge>
                            ) : (
                              <Badge variant="destructive">Pending</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Processing Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Assets Registered</p>
                        <p className="text-sm text-gray-600">{totalAssets} assets in inventory</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Classification Complete</p>
                        <p className="text-sm text-gray-600">{classifiedAssets} of {totalAssets} assets</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Risk Assessment Complete</p>
                        <p className="text-sm text-gray-600">{riskAssessedAssets} of {totalAssets} assets</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Full Processing Complete</p>
                        <p className="text-sm text-gray-600">{completedAssets} of {totalAssets} assets</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {totalAssets - classifiedAssets > 0 && (
                      <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <p className="font-medium text-yellow-800">Classification Pending</p>
                        <p className="text-sm text-yellow-700">
                          {totalAssets - classifiedAssets} assets need classification. 
                          Complete asset classification for comprehensive security assessment.
                        </p>
                      </div>
                    )}
                    
                    {(riskLevelCounts['High Risk'] || 0) > 0 && (
                      <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                        <p className="font-medium text-red-800">High Risk Assets</p>
                        <p className="text-sm text-red-700">
                          {riskLevelCounts['High Risk']} assets require immediate risk mitigation. 
                          Review and implement appropriate security controls.
                        </p>
                      </div>
                    )}
                    
                    {totalAssets - riskAssessedAssets > 0 && (
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                        <p className="font-medium text-blue-800">Risk Assessment Pending</p>
                        <p className="text-sm text-blue-700">
                          {totalAssets - riskAssessedAssets} assets need risk assessment. 
                          Complete CIA triad evaluation for all classified assets.
                        </p>
                      </div>
                    )}
                    
                    {completedAssets === totalAssets && totalAssets > 0 && (
                      <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                        <p className="font-medium text-green-800">All Assets Processed</p>
                        <p className="text-sm text-green-700">
                          Excellent! All assets have been classified and risk assessed. 
                          Continue with regular monitoring and updates.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default AssetClassificationReportPage;