'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useAsset,
  useAssets,
  useUpdateAsset,
  Asset
} from '@/lib/hooks/useAssets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Target,
  FileText,
  Loader2,
  Save,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/common/PageContainer';

const RiskHandlingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');

  // State
  const [selectedAssetId, setSelectedAssetId] = useState(assetId || '');
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');

  // Hooks
  const { data: assetsData, isLoading: assetsLoading } = useAssets();
  const { data: selectedAsset, isLoading: assetLoading } = useAsset(selectedAssetId) as { data: Asset | undefined, isLoading: boolean };
  const updateAssetMutation = useUpdateAsset();

  const assets = assetsData?.results || [];
  const isLoading = assetsLoading || assetLoading;

  // Filter assets that have model comparison completed
  const eligibleAssets = assets.filter((asset: any) => 
    asset.traditional_fuzzy_prediction && 
    asset.modern_svm_prediction && 
    asset.modern_dt_prediction
  );

  // Risk treatment options
  const treatmentOptions = [
    {
      value: 'Mitigate',
      label: 'Mitigate',
      description: 'Implement controls to reduce the likelihood or impact of the risk',
      icon: Shield,
      color: 'text-blue-600',
      recommended: ['High Risk', 'Very High Risk']
    },
    {
      value: 'Accept',
      label: 'Accept',
      description: 'Accept the risk as it falls within acceptable tolerance levels',
      icon: CheckCircle,
      color: 'text-green-600',
      recommended: ['Low Risk', 'Medium Risk']
    },
    {
      value: 'Transfer',
      label: 'Transfer',
      description: 'Transfer the risk to a third party (insurance, outsourcing)',
      icon: Target,
      color: 'text-purple-600',
      recommended: ['High Risk', 'Medium Risk']
    },
    {
      value: 'Avoid',
      label: 'Avoid',
      description: 'Eliminate the risk by changing or discontinuing the activity',
      icon: AlertTriangle,
      color: 'text-red-600',
      recommended: ['Very High Risk']
    }
  ];

  const handleSaveTreatment = async () => {
    if (!selectedAssetId || !selectedTreatment) {
      toast.error('Please select an asset and treatment option');
      return;
    }

    try {
      await updateAssetMutation.mutateAsync({
        id: selectedAssetId,
        data: {
          risk_treatment: selectedTreatment,
          treatment_notes: treatmentNotes
        }
      });
      
      toast.success('Risk treatment plan saved successfully');
    } catch (error) {
      toast.error('Failed to save risk treatment plan');
    }
  };

  const getConsensusRisk = (asset: any) => {
    if (!asset.traditional_fuzzy_prediction || !asset.modern_svm_prediction || !asset.modern_dt_prediction) {
      return 'Unknown';
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
    return Object.keys(predictionCounts).find(key => predictionCounts[key] === maxCount) || 'Unknown';
  };

  const getRecommendedTreatments = (riskLevel: string) => {
    return treatmentOptions.filter(option => 
      option.recommended.includes(riskLevel)
    );
  };

  const getRiskBadge = (riskLevel: string) => {
    const variant = 
      riskLevel === 'Very High Risk' || riskLevel === 'High Risk' ? 'destructive' :
      riskLevel === 'Medium Risk' ? 'default' : 'secondary';
    
    return <Badge variant={variant}>{riskLevel}</Badge>;
  };

  if (isLoading) {
    return (
      <PageContainer title="Risk Treatment" description="Define risk treatment strategies and action plans">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Risk Treatment" description="Define risk treatment strategies and action plans">
      <div className="space-y-6">
        {/* Asset Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Asset Selection for Risk Treatment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="asset-select">Select Asset with Completed Analysis</Label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an asset for risk treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleAssets.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No assets with completed analysis found
                      </SelectItem>
                    ) : (
                      eligibleAssets.map((asset: any) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{asset.asset_type}</Badge>
                            <span>{asset.asset}</span>
                            {getRiskBadge(getConsensusRisk(asset))}
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
                  
                  {/* Risk Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <Label className="text-xs text-gray-500">Consensus Risk</Label>
                      <div className="font-medium">{getConsensusRisk(selectedAsset)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Risk Level</Label>
                      <div className="font-medium">{selectedAsset.calculated_risk_level?.toFixed(2)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Current Treatment</Label>
                      <div className="font-medium">
                        {selectedAsset.risk_treatment || 'Not Set'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Asset Value</Label>
                      <div className="font-medium">{selectedAsset.asset_value_name}</div>
                    </div>
                  </div>

                  {/* Model Predictions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                    <div className="text-xs">
                      <span className="text-gray-500">Fuzzy Logic:</span> {selectedAsset.traditional_fuzzy_prediction}
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">SVM:</span> {selectedAsset.modern_svm_prediction}
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Decision Tree:</span> {selectedAsset.modern_dt_prediction}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedAsset.asset_type}</Badge>
                    <Badge variant="secondary">{selectedAsset.owner_department_name}</Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedAsset && (
          <>
            {/* Risk Treatment Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Risk Treatment Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Risk Assessment */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Risk Assessment Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Consensus Classification:</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {getRiskBadge(getConsensusRisk(selectedAsset))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Quantitative Risk Level:</Label>
                        <div className="font-medium mt-1">
                          {selectedAsset.calculated_risk_level?.toFixed(2)} / 5.0
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Treatment Options */}
                  <div>
                    <Label className="text-base font-medium mb-4 block">Select Treatment Strategy</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {treatmentOptions.map((option) => {
                        const Icon = option.icon;
                        const isRecommended = option.recommended.includes(getConsensusRisk(selectedAsset));
                        
                        return (
                          <div
                            key={option.value}
                            className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedTreatment === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${isRecommended ? 'ring-2 ring-green-200' : ''}`}
                            onClick={() => setSelectedTreatment(option.value)}
                          >
                            {isRecommended && (
                              <Badge className="absolute -top-2 -right-2 bg-green-500">
                                Recommended
                              </Badge>
                            )}
                            <div className="flex items-start gap-3">
                              <Icon className={`h-6 w-6 ${option.color} mt-1`} />
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{option.label}</h4>
                                <p className="text-sm text-gray-600">{option.description}</p>
                              </div>
                              <div className="w-4 h-4 mt-1">
                                {selectedTreatment === option.value && (
                                  <CheckCircle className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommended Treatments */}
                  {(() => {
                    const recommended = getRecommendedTreatments(getConsensusRisk(selectedAsset));
                    return recommended.length > 0 ? (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium mb-2">Recommended for {getConsensusRisk(selectedAsset)} Assets:</h4>
                        <div className="flex flex-wrap gap-2">
                          {recommended.map((treatment) => (
                            <Badge key={treatment.value} variant="outline" className="bg-white">
                              {treatment.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Treatment Notes */}
                  <div>
                    <Label htmlFor="treatment-notes">Treatment Implementation Notes</Label>
                    <Textarea
                      id="treatment-notes"
                      placeholder="Describe the specific implementation plan, controls, timelines, and responsibilities..."
                      value={treatmentNotes}
                      onChange={(e) => setTreatmentNotes(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  {/* Save Action */}
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={handleSaveTreatment}
                      disabled={updateAssetMutation.isPending || !selectedTreatment}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updateAssetMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Treatment Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Plan Summary */}
            {selectedAsset.risk_treatment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Current Treatment Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">Treatment Strategy</Label>
                        <div className="font-medium text-lg">{selectedAsset.risk_treatment}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Risk Level</Label>
                        <div className="font-medium">{getConsensusRisk(selectedAsset)}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Asset Priority</Label>
                        <div className="font-medium">{selectedAsset.asset_value_name}</div>
                      </div>
                    </div>

                    {selectedAsset.treatment_notes && (
                      <div>
                        <Label className="text-sm text-gray-500">Implementation Notes</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                          {selectedAsset.treatment_notes}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={() => router.push(`/classification/asset-assessment?id=${selectedAssetId}`)}
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Complete Assessment
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
                <h3 className="text-lg font-medium mb-2">No Assets Ready for Risk Treatment</h3>
                <p className="text-gray-600 mb-4">
                  Risk treatment requires assets to have completed model comparison first.
                </p>
                <Button
                  onClick={() => router.push('/classification/asset-classify')}
                  variant="outline"
                >
                  Go to Model Comparison
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default RiskHandlingPage;
