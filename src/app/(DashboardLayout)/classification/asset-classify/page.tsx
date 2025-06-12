'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useAsset,
  useAssets,
  useCompareModels,
  usePerformanceMetrics,
  Asset
} from '@/lib/hooks/useAssets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  GitCompare, 
  Brain, 
  Zap,
  BarChart3,
  CheckCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/common/PageContainer';

const AssetClassifyPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');

  // State
  const [selectedAssetId, setSelectedAssetId] = useState(assetId || '');
  const [comparisonComplete, setComparisonComplete] = useState(false);

  // Hooks
  const { data: assetsData, isLoading: assetsLoading } = useAssets();
  const { data: selectedAsset, isLoading: assetLoading } = useAsset(selectedAssetId) as { data: Asset | undefined, isLoading: boolean };
  const { data: performanceMetrics, isLoading: metricsLoading } = usePerformanceMetrics();
  const compareModelsMutation = useCompareModels();

  const assets = assetsData?.results || [];
  const isLoading = assetsLoading || assetLoading || metricsLoading;

  // Filter assets that have risk analysis completed
  const eligibleAssets = assets.filter((asset: any) => asset.calculated_risk_level);

  const handleCompareModels = async () => {
    if (!selectedAssetId) {
      toast.error('Please select an asset');
      return;
    }

    try {
      await compareModelsMutation.mutateAsync(selectedAssetId);
      setComparisonComplete(true);
      toast.success('Model comparison completed successfully');
    } catch (error) {
      toast.error('Failed to compare models');
    }
  };

  const getModelAccuracy = (modelType: string) => {
    if (!performanceMetrics) return 'N/A';
    
    const metric = performanceMetrics.find((m: any) => 
      m.approach.toLowerCase().includes(modelType.toLowerCase())
    );
    return metric ? `${(metric.accuracy * 100).toFixed(1)}%` : 'N/A';
  };

  const getPredictionBadge = (prediction?: string) => {
    if (!prediction) return <Badge variant="secondary">Not Predicted</Badge>;
    
    const variant = 
      prediction === 'High Risk' ? 'destructive' :
      prediction === 'Medium Risk' ? 'default' : 'secondary';
    
    return <Badge variant={variant}>{prediction}</Badge>;
  };

  const getConsensus = (asset: any) => {
    if (!asset.traditional_fuzzy_prediction || !asset.modern_svm_prediction || !asset.modern_dt_prediction) {
      return { consensus: 'Incomplete', confidence: 0, color: 'bg-gray-500' };
    }

    const predictions = [
      asset.traditional_fuzzy_prediction,
      asset.modern_svm_prediction,
      asset.modern_dt_prediction
    ];

    const predictionCounts = predictions.reduce((acc: any, pred) => {
      acc[pred] = (acc[pred] || 0) + 1;
      return acc;
    }, {});

    const maxCount = Math.max(...Object.values(predictionCounts) as number[]);
    const consensus = Object.keys(predictionCounts).find(key => predictionCounts[key] === maxCount);
    const confidence = (maxCount / predictions.length) * 100;

    const color = 
      consensus === 'High Risk' ? 'bg-red-500' :
      consensus === 'Medium Risk' ? 'bg-yellow-500' : 'bg-green-500';

    return { consensus, confidence, color };
  };

  if (isLoading) {
    return (
      <PageContainer title="Model Comparison" description="Compare traditional and modern ML approaches">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Model Comparison" description="Compare traditional and modern ML approaches">
      <div className="space-y-6">
        {/* Asset Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Asset Selection for Model Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="asset-select">Select Asset with Risk Analysis</Label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an asset to compare models" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleAssets.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No assets with risk analysis found
                      </SelectItem>
                    ) : (
                      eligibleAssets.map((asset: any) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{asset.asset_type}</Badge>
                            <span>{asset.asset}</span>
                            <Badge variant="secondary">
                              Risk: {asset.calculated_risk_level?.toFixed(1)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedAsset && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedAsset.asset}</h4>
                  <p className="text-sm text-gray-600 mb-3">{selectedAsset.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                    <div>
                      <Label className="text-xs text-gray-500">Risk Level</Label>
                      <div className="font-medium">{selectedAsset.calculated_risk_level?.toFixed(2)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Category</Label>
                      <div className="font-medium">{selectedAsset.mathematical_risk_category}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">C</Label>
                      <div className="font-medium">{selectedAsset.confidentiality ? (selectedAsset.confidentiality * 100).toFixed(0) + '%' : 'N/A'}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">I</Label>
                      <div className="font-medium">{selectedAsset.integrity ? (selectedAsset.integrity * 100).toFixed(0) + '%' : 'N/A'}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">A</Label>
                      <div className="font-medium">{selectedAsset.availability ? (selectedAsset.availability * 100).toFixed(0) + '%' : 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedAsset.asset_type}</Badge>
                    <Badge variant="secondary">{selectedAsset.owner_department_name}</Badge>
                    <Badge>{selectedAsset.asset_value_name}</Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Model Performance Overview */}
        {performanceMetrics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Model Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {performanceMetrics.map((metric: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">{metric.approach}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Accuracy:</span>
                        <span className="font-medium">{(metric.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Precision:</span>
                        <span className="font-medium">{(metric.precision * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Recall:</span>
                        <span className="font-medium">{(metric.recall * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium">F1-Score:</span>
                        <span className="font-bold">{(metric.f1_score * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedAsset && selectedAsset.calculated_risk_level && (
          <>
            {/* Model Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Classification Model Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Models Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Traditional Fuzzy Logic */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium">Traditional Fuzzy Logic</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Prediction:</Label>
                          {getPredictionBadge(selectedAsset.traditional_fuzzy_prediction)}
                        </div>
                        <div>
                          <Label className="text-sm">Accuracy:</Label>
                          <div className="font-medium">{getModelAccuracy('fuzzy')}</div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Rule-based approach using linguistic variables and fuzzy sets
                        </div>
                      </div>
                    </div>

                    {/* Modern SVM */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-5 w-5 text-green-500" />
                        <h4 className="font-medium">Modern SVM</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Prediction:</Label>
                          {getPredictionBadge(selectedAsset.modern_svm_prediction)}
                        </div>
                        <div>
                          <Label className="text-sm">Accuracy:</Label>
                          <div className="font-medium">{getModelAccuracy('svm')}</div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Support Vector Machine with kernel optimization
                        </div>
                      </div>
                    </div>

                    {/* Modern Decision Tree */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                        <h4 className="font-medium">Modern Decision Tree</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Prediction:</Label>
                          {getPredictionBadge(selectedAsset.modern_dt_prediction)}
                        </div>
                        <div>
                          <Label className="text-sm">Accuracy:</Label>
                          <div className="font-medium">{getModelAccuracy('decision')}</div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Enhanced decision tree with pruning and ensemble methods
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Action */}
                  <div className="flex justify-center pt-4">
                    {selectedAsset.traditional_fuzzy_prediction && 
                     selectedAsset.modern_svm_prediction && 
                     selectedAsset.modern_dt_prediction ? (
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="text-green-600 font-medium">Model Comparison Completed</p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleCompareModels}
                        disabled={compareModelsMutation.isPending}
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {compareModelsMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <GitCompare className="h-4 w-4 mr-2" />
                        )}
                        Compare Models
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Results */}
            {(selectedAsset.traditional_fuzzy_prediction || comparisonComplete) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Comparison Results & Consensus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Consensus Analysis */}
                    {(() => {
                      const consensus = getConsensus(selectedAsset);
                      return (
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-4">Model Consensus</h4>
                          <Badge className={`${consensus.color} text-white text-lg px-6 py-2 mb-2`}>
                            {consensus.consensus}
                          </Badge>
                          <div className="text-sm text-gray-600">
                            Confidence: {consensus.confidence.toFixed(0)}% agreement
                          </div>
                        </div>
                      );
                    })()}

                    {/* Detailed Comparison */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 p-3 text-left">Model</th>
                            <th className="border border-gray-200 p-3 text-center">Prediction</th>
                            <th className="border border-gray-200 p-3 text-center">Accuracy</th>
                            <th className="border border-gray-200 p-3 text-center">Approach</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-200 p-3 font-medium">Traditional Fuzzy Logic</td>
                            <td className="border border-gray-200 p-3 text-center">
                              {getPredictionBadge(selectedAsset.traditional_fuzzy_prediction)}
                            </td>
                            <td className="border border-gray-200 p-3 text-center">{getModelAccuracy('fuzzy')}</td>
                            <td className="border border-gray-200 p-3 text-center text-sm">Rule-based</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-3 font-medium">Modern SVM</td>
                            <td className="border border-gray-200 p-3 text-center">
                              {getPredictionBadge(selectedAsset.modern_svm_prediction)}
                            </td>
                            <td className="border border-gray-200 p-3 text-center">{getModelAccuracy('svm')}</td>
                            <td className="border border-gray-200 p-3 text-center text-sm">ML-based</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-3 font-medium">Modern Decision Tree</td>
                            <td className="border border-gray-200 p-3 text-center">
                              {getPredictionBadge(selectedAsset.modern_dt_prediction)}
                            </td>
                            <td className="border border-gray-200 p-3 text-center">{getModelAccuracy('decision')}</td>
                            <td className="border border-gray-200 p-3 text-center text-sm">Tree-based</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Analysis Summary */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Analysis Summary</h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        <p>
                          <strong>Model Performance:</strong> Based on the comparison, the Modern SVM approach 
                          shows the highest accuracy at {getModelAccuracy('svm')}, followed by Decision Tree 
                          at {getModelAccuracy('decision')} and Traditional Fuzzy Logic at {getModelAccuracy('fuzzy')}.
                        </p>
                        <p>
                          <strong>Prediction Consensus:</strong> {(() => {
                            const consensus = getConsensus(selectedAsset);
                            return `${consensus.confidence.toFixed(0)}% of models agree on "${consensus.consensus}" classification.`;
                          })()}
                        </p>
                        <p>
                          <strong>Recommendation:</strong> The consensus classification should be used for 
                          risk management decisions, with consideration of the confidence level.
                        </p>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="flex justify-center">
                      <Button
                        onClick={() => router.push(`/classification/risk-handling?id=${selectedAssetId}`)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Proceed to Risk Treatment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* No Eligible Assets Message */}
        {eligibleAssets.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Assets Ready for Model Comparison</h3>
                <p className="text-gray-600 mb-4">
                  Model comparison requires assets to have completed risk analysis first.
                </p>
                <Button
                  onClick={() => router.push('/classification/risk-analysis')}
                  variant="outline"
                >
                  Go to Risk Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default AssetClassifyPage;
