'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  useAsset, 
  useAssets,
  useAnalyzeRisk
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
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  Calculator,
  CheckCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/common/PageContainer';

const RiskAnalysisPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');

  // State
  const [selectedAssetId, setSelectedAssetId] = useState(assetId || '');
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Hooks
  const { data: assetsData, isLoading: assetsLoading } = useAssets();
  const { data: selectedAsset, isLoading: assetLoading } = useAsset(selectedAssetId);
  const analyzeRiskMutation = useAnalyzeRisk();

  const assets = assetsData?.results || [];
  const isLoading = assetsLoading || assetLoading;

  // Filter assets that have risk identification completed
  const eligibleAssets = assets.filter((asset: any) => asset.risk_index);

  const handleAnalyzeRisk = async () => {
    if (!selectedAssetId) {
      toast.error('Please select an asset');
      return;
    }

    try {
      await analyzeRiskMutation.mutateAsync(selectedAssetId);
      setAnalysisComplete(true);
      toast.success('Risk analysis completed successfully');
    } catch (error) {
      toast.error('Failed to analyze risk');
    }
  };

  const getRiskLevel = (value?: number) => {
    if (!value) return { label: 'Unknown', color: 'bg-gray-500', textColor: 'text-gray-600' };
    if (value >= 4) return { label: 'Very High', color: 'bg-red-600', textColor: 'text-red-600' };
    if (value >= 3) return { label: 'High', color: 'bg-red-500', textColor: 'text-red-500' };
    if (value >= 2) return { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    if (value >= 1) return { label: 'Low', color: 'bg-blue-500', textColor: 'text-blue-600' };
    return { label: 'Very Low', color: 'bg-gray-400', textColor: 'text-gray-500' };
  };

  const calculateRiskMetrics = (asset: any) => {
    if (!asset.risk_index) return null;

    const probability = asset.risk_index * 0.2; // Probability factor
    const impact = asset.risk_index * 1.1; // Impact factor
    const riskLevel = probability * impact;
    
    return {
      probability: probability.toFixed(2),
      impact: impact.toFixed(2),
      riskLevel: riskLevel.toFixed(2),
      category: riskLevel > 3.5 ? 'High Risk' : riskLevel > 2.5 ? 'Medium Risk' : 'Low Risk'
    };
  };

  if (isLoading) {
    return (
      <PageContainer title="Risk Analysis" description="Quantitative risk analysis using mathematical models">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Risk Analysis" description="Quantitative risk analysis using mathematical models">
      <div className="space-y-6">
        {/* Asset Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Asset Selection for Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="asset-select">Select Asset with Risk Identification</Label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an asset to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleAssets.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No assets with risk identification found
                      </SelectItem>
                    ) : (
                      eligibleAssets.map((asset: any) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{asset.asset_type}</Badge>
                            <span>{asset.asset}</span>
                            <Badge variant="secondary">Risk Index: {asset.risk_index?.toFixed(1)}</Badge>
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
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <Label className="text-xs text-gray-500">Confidentiality</Label>
                      <div className="font-medium">{selectedAsset.confidentiality || 'N/A'}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Integrity</Label>
                      <div className="font-medium">{selectedAsset.integrity || 'N/A'}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Availability</Label>
                      <div className="font-medium">{selectedAsset.availability || 'N/A'}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Risk Index</Label>
                      <div className="font-medium">{selectedAsset.risk_index?.toFixed(2) || 'N/A'}</div>
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

        {selectedAsset && selectedAsset.risk_index && (
          <>
            {/* Risk Analysis Methodology */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Quantitative Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Risk Formula */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Risk Calculation Formula</h4>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-mono">Risk = Probability × Impact</div>
                          <div className="text-sm text-gray-600 mt-2">
                            Where:
                            <br />Probability = Risk Index × 0.2
                            <br />Impact = Risk Index × 1.1
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Current Calculations */}
                    {(() => {
                      const metrics = calculateRiskMetrics(selectedAsset);
                      return metrics ? (
                        <div className="space-y-3">
                          <h4 className="font-medium">Current Calculations</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Probability:</span>
                              <span className="font-medium">{metrics.probability}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Impact:</span>
                              <span className="font-medium">{metrics.impact}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-sm font-medium">Risk Level:</span>
                              <span className="font-bold">{metrics.riskLevel}</span>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* Risk Category */}
                    {(() => {
                      const metrics = calculateRiskMetrics(selectedAsset);
                      const riskInfo = getRiskLevel(parseFloat(metrics?.riskLevel || '0'));
                      return (
                        <div className="space-y-3">
                          <h4 className="font-medium">Risk Category</h4>
                          <div className="text-center">
                            <Badge className={`${riskInfo.color} text-white text-lg px-4 py-2`}>
                              {riskInfo.label}
                            </Badge>
                            <div className="text-sm text-gray-600 mt-2">
                              {metrics?.category}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Analysis Action */}
                  <div className="flex justify-center pt-4">
                    {selectedAsset.calculated_risk_level ? (
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="text-green-600 font-medium">Risk Analysis Completed</p>
                        <p className="text-sm text-gray-600">
                          Calculated Risk Level: {selectedAsset.calculated_risk_level.toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleAnalyzeRisk}
                        disabled={analyzeRiskMutation.isPending}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {analyzeRiskMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Calculator className="h-4 w-4 mr-2" />
                        )}
                        Perform Risk Analysis
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Analysis Results */}
            {(selectedAsset.calculated_risk_level || analysisComplete) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Risk Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {(selectedAsset.risk_index * 0.2).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Probability</div>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedAsset.harm_value?.toFixed(2) || (selectedAsset.risk_index * 1.1).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Impact/Harm</div>
                      </div>
                      
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedAsset.calculated_risk_level?.toFixed(2) || 'Calculating...'}
                        </div>
                        <div className="text-sm text-gray-600">Risk Level</div>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Badge className={`${getRiskLevel(selectedAsset.calculated_risk_level).color} text-white`}>
                          {selectedAsset.mathematical_risk_category || getRiskLevel(selectedAsset.calculated_risk_level).label}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">Category</div>
                      </div>
                    </div>

                    {/* Risk Interpretation */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Risk Interpretation</h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        <p>
                          <strong>Mathematical Risk Assessment:</strong> Based on the quantitative analysis, 
                          this asset has been categorized as <strong>{selectedAsset.mathematical_risk_category || 'being analyzed'}</strong>.
                        </p>
                        <p>
                          <strong>Risk Score:</strong> {selectedAsset.calculated_risk_level?.toFixed(2) || 'Calculating...'} 
                          (Scale: 0-5, where 5 represents the highest risk)
                        </p>
                        <p>
                          <strong>Recommendation:</strong> {
                            selectedAsset.calculated_risk_level > 3.5 ? 
                            'Immediate risk mitigation measures should be implemented.' :
                            selectedAsset.calculated_risk_level > 2.5 ?
                            'Risk monitoring and moderate mitigation measures are recommended.' :
                            'Current risk levels are acceptable with standard monitoring.'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="flex justify-center">
                      <Button
                        onClick={() => router.push(`/classification/asset-classify?id=${selectedAssetId}`)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Proceed to Model Comparison
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
                <h3 className="text-lg font-medium mb-2">No Assets Ready for Analysis</h3>
                <p className="text-gray-600 mb-4">
                  Risk analysis requires assets to have completed risk identification first.
                </p>
                <Button
                  onClick={() => router.push('/classification/risk-identification')}
                  variant="outline"
                >
                  Go to Risk Identification
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default RiskAnalysisPage;
