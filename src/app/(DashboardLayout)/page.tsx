"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Shield,
  BarChart3,
  LayoutDashboard,
  Database,
  RefreshCw,
  Award,
  Target,
  BookOpen,
  Brain,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";
import PageContainer from "@/components/common/PageContainer";
import { useAssets, usePerformanceMetrics } from "@/lib/hooks/useAssets";
import RiskDistributionChart from "@/components/dashboard/RiskDistributionChart";
import ClassificationOverview from "@/components/dashboard/ClassificationOverview";
import ModelComparisonChart from "@/components/dashboard/ModelComparisonChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Fetch data
  const { data: assetsData, isLoading: assetsLoading, refetch: refetchAssets } = useAssets();
  const { data: metricsData, isLoading: metricsLoading, refetch: refetchMetrics } = usePerformanceMetrics();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchAssets(), refetchMetrics()]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  if (!isMounted || assetsLoading || metricsLoading) {
    return (
      <PageContainer title="Asset Classification Dashboard" description="Information Asset Security Risk Classification Framework">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-gray-700">Loading Dashboard</p>
            <p className="text-sm text-gray-500">Fetching asset classification data...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Calculate metrics from real API data only
  const assets = assetsData?.results || [];
  const totalAssets = assetsData?.count || 0;
  const classifiedAssets = assets.filter((asset: any) => asset.classification).length;
  const riskIdentified = assets.filter((asset: any) => asset.risk_index !== null).length;
  const riskAnalyzed = assets.filter((asset: any) => asset.calculated_risk_level !== null).length;
  const fullyCycled = assets.filter((asset: any) => 
    asset.classification && asset.risk_index && asset.calculated_risk_level
  ).length;

  const classificationProgress = totalAssets > 0 ? (classifiedAssets / totalAssets) * 100 : 0;
  const riskProgress = totalAssets > 0 ? (riskIdentified / totalAssets) * 100 : 0;
  const analysisProgress = totalAssets > 0 ? (riskAnalyzed / totalAssets) * 100 : 0;
  const completionProgress = totalAssets > 0 ? (fullyCycled / totalAssets) * 100 : 0;

  const riskDistribution = assets.reduce((acc: any, asset: any) => {
    const category = asset.mathematical_risk_category || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const classificationDistribution = assets.reduce((acc: any, asset: any) => {
    const classification = asset.classification || 'Unclassified';
    acc[classification] = (acc[classification] || 0) + 1;
    return acc;
  }, {});

  // Only use real API performance metrics - no defaults
  const performanceMetrics = metricsData || [];
  const highRiskAssets = assets.filter((asset: any) => asset.mathematical_risk_category === 'High Risk').length;
  const criticalAssets = assets.filter((asset: any) => asset.classification === 'High' || asset.classification === 'Very High').length;
  
  // Calculate system accuracy only from real API data
  const systemAccuracy = performanceMetrics.length > 0
    ? performanceMetrics.reduce((avg: number, metric: any) => avg + (metric.accuracy || 0), 0) / performanceMetrics.length
    : 0; // No default value - show 0 if no real data

  const safeFormat = (value: any, decimals: number = 1) => {
    const num = Number(value);
    return isNaN(num) ? '0.0' : num.toFixed(decimals);
  };

  return (
    <PageContainer title="Asset Classification Dashboard" description="Information Asset Security Risk Classification Framework">
      <div className="space-y-6">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Brain className="h-10 w-10 text-white" />
                <div>
                  <CardTitle className="text-3xl font-bold">Asset Classification Framework</CardTitle>
                  <p className="text-blue-100">Information Asset Security Risk Management System</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
                <Badge className="bg-white/20 text-white px-3 py-1">
                  <Activity className="h-3 w-3 mr-1" />
                  {systemAccuracy > 0 ? `${safeFormat(systemAccuracy * 100)}% Accuracy` : 'No Data'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold">{totalAssets}</p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
              <Progress value={100} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Classified</p>
                  <p className="text-2xl font-bold">{classifiedAssets}</p>
                  <p className="text-xs text-gray-500">{safeFormat(classificationProgress)}%</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
              <Progress value={classificationProgress} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Risk Identified</p>
                  <p className="text-2xl font-bold">{riskIdentified}</p>
                  <p className="text-xs text-gray-500">{safeFormat(riskProgress)}%</p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
              <Progress value={riskProgress} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Risk</p>
                  <p className="text-2xl font-bold">{highRiskAssets}</p>
                  <p className="text-xs text-gray-500">Need Attention</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Complete</p>
                  <p className="text-2xl font-bold">{fullyCycled}</p>
                  <p className="text-xs text-gray-500">{safeFormat(completionProgress)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
              <Progress value={completionProgress} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Five-Phase Framework */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Five-Phase Classification Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <h4 className="font-semibold">Asset Classification</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">Fuzzy logic-based asset classification</p>
                <Progress value={classificationProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{safeFormat(classificationProgress)}% complete</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <h4 className="font-semibold">Risk Identification</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">CIA-based risk assessment</p>
                <Progress value={riskProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{safeFormat(riskProgress)}% complete</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <h4 className="font-semibold">Classification Report</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">Comprehensive reporting</p>
                <Progress value={classifiedAssets > 0 ? 100 : 0} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{classifiedAssets > 0 ? '100%' : '0%'} available</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <h4 className="font-semibold">Risk Analysis</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">Quantitative risk analysis</p>
                <Progress value={analysisProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{safeFormat(analysisProgress)}% complete</p>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                  <h4 className="font-semibold">Risk Handling</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">Risk mitigation strategies</p>
                <Progress value={riskAnalyzed > 0 ? 100 : 0} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{riskAnalyzed > 0 ? '100%' : '0%'} available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Research Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <RiskDistributionChart
                  data={riskDistribution}
                  title="Risk Distribution"
                />
              </Card>
              <Card>
                <ClassificationOverview
                  data={classificationDistribution}
                  title="Classification Overview"
                />
              </Card>
            </div>
            
            <Card>
              <ModelComparisonChart
                metrics={performanceMetrics}
                title="Model Performance Comparison"
                subtitle="Traditional Fuzzy Logic vs Modern Machine Learning"
              />
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="xl:col-span-2">
                <RecentActivity assets={assets.slice(0, 10)} />
              </Card>
              <Card>
                <QuickActions
                  totalAssets={totalAssets}
                  unclassifiedAssets={totalAssets - classifiedAssets}
                  pendingRiskAnalysis={totalAssets - riskAnalyzed}
                />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Research Framework Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Research Objectives</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        Develop comprehensive cloud asset classification framework
                      </li>
                      <li className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        Compare traditional fuzzy logic with modern ML approaches
                      </li>
                      <li className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        Establish CIA-based risk assessment methodology
                      </li>
                      <li className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        Provide quantitative risk analysis framework
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Key Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{performanceMetrics.length}</div>
                        <p className="text-sm text-blue-600">Models</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">5</div>
                        <p className="text-sm text-green-600">Phases</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {systemAccuracy > 0 ? safeFormat(systemAccuracy * 100, 0) + '%' : 'N/A'}
                        </div>
                        <p className="text-sm text-purple-600">Accuracy</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-xl font-bold text-orange-600">{totalAssets}</div>
                        <p className="text-sm text-orange-600">Assets</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">Academic Standards</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Five-phase methodology</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Quantitative evaluation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Comprehensive documentation</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Model comparison</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Statistical analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Publication ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
