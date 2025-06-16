'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useAsset,
  useAssets,
  useIdentifyRisk,
  useRiskIdentificationMethodologies,
  Asset
} from '@/lib/hooks/useAssets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
  Lock,
  Loader2,
  ArrowRight,
  Settings,
  AlertTriangle,
  Target,
  BookOpen,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/common/PageContainer';

interface RiskAssessmentResult {
  asset_id: string;
  asset_name: string;
  methodologies_used: string[];
  assessment_timestamp: string;
  integrated_assessment: {
    methodology: string;
    risk_score: number;
    risk_level: string;
    likelihood: number;
    impact: number;
    threats_count: number;
    vulnerabilities_count: number;
    compliance_frameworks: string[];
  };
  individual_assessments: Record<string, any>;
  validation: {
    is_valid: boolean;
    completeness_score: number;
    quality_indicators: Record<string, string>;
  };
  compliance_status: {
    iso_27005_compliant: boolean;
    nist_compliant: boolean;
    overall_compliance: number;
  };
  cia_scores: {
    confidentiality: number;
    integrity: number;
    availability: number;
  };
  recommendations: string[];
  next_steps: string[];
}

interface MethodologyInfo {
  name: string;
  description: string;
  approaches: string[];
  compliance_frameworks: string[];
  best_for: string;
  implementation_status: string;
}

interface MethodologiesResponse {
  available_methodologies: Record<string, MethodologyInfo>;
  default_methodology: string;
  recommended_combination: string[];
  implementation_guide: Record<string, string>;
}

const RiskIdentificationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');

  // State
  const [selectedAssetId, setSelectedAssetId] = useState(assetId || '');
  const [selectedMethodology, setSelectedMethodology] = useState('integrated');
  const [selectedMethodologies, setSelectedMethodologies] = useState<string[]>(['iso_27005', 'nist_sp_800_30', 'octave']);
  const [assessmentResult, setAssessmentResult] = useState<RiskAssessmentResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Hooks
  const { data: assetsData, isLoading: assetsLoading } = useAssets();
  const { data: selectedAsset, isLoading: assetLoading } = useAsset(selectedAssetId) as { data: Asset | undefined, isLoading: boolean };
  const { data: methodologies, isLoading: methodologiesLoading } = useRiskIdentificationMethodologies(selectedAssetId) as { data: MethodologiesResponse | undefined, isLoading: boolean };
  const identifyRiskMutation = useIdentifyRisk();

  const assets = assetsData?.results || [];
  const isLoading = assetsLoading || assetLoading || methodologiesLoading;

  // Get CIA values from the asset
  const confidentialityScore = selectedAsset?.confidentiality || 0;
  const integrityScore = selectedAsset?.integrity || 0;
  const availabilityScore = selectedAsset?.availability || 0;

  const handleMethodologyToggle = (methodology: string, checked: boolean) => {
    if (checked) {
      setSelectedMethodologies(prev => [...prev, methodology]);
    } else {
      setSelectedMethodologies(prev => prev.filter(m => m !== methodology));
    }
  };

  const canPerformAssessment = () => {
    return selectedAssetId && 
           (confidentialityScore > 0 || integrityScore > 0 || availabilityScore > 0) &&
           selectedMethodologies.length > 0;
  };

  const handleSubmit = async () => {
    if (!selectedAssetId) {
      toast.error('Please select an asset');
      return;
    }

    if (confidentialityScore === 0 && integrityScore === 0 && availabilityScore === 0) {
      toast.error('Asset must have CIA scores. Please complete asset classification first.');
      return;
    }

    if (selectedMethodologies.length === 0) {
      toast.error('Please select at least one methodology');
      return;
    }

    try {
      const result = await identifyRiskMutation.mutateAsync({
        id: selectedAssetId,
        data: {
          confidentiality: confidentialityScore,
          integrity: integrityScore,
          availability: availabilityScore,
          methodology: selectedMethodology,
          include_methodologies: selectedMethodologies
        }
      });
      
      setAssessmentResult(result as RiskAssessmentResult);
      setShowResults(true);
      toast.success('Risk identification completed successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to identify risk');
    }
  };

  const handleContinueToAnalysis = () => {
    router.push(`/classification/risk-analysis?id=${selectedAssetId}`);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'very low': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'very high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Confidentiality': return Lock;
      case 'Integrity': return CheckCircle;
      case 'Availability': return Shield;
      default: return Info;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Confidentiality': return 'text-red-600 bg-red-50';
      case 'Integrity': return 'text-blue-600 bg-blue-50';
      case 'Availability': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Risk Identification" description="Identify risks using standardized methodologies">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (showResults && assessmentResult) {
    return (
      <PageContainer title="Risk Assessment Results" description="Comprehensive risk identification results">
        <div className="space-y-6">
          {/* Results Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Risk Assessment Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(assessmentResult.integrated_assessment.risk_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Risk Score</div>
                </div>
                <div className="text-center">
                  <Badge className={`text-lg px-4 py-2 ${getRiskLevelColor(assessmentResult.integrated_assessment.risk_level)}`}>
                    {assessmentResult.integrated_assessment.risk_level}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">Risk Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {assessmentResult.methodologies_used.length}
                  </div>
                  <div className="text-sm text-gray-600">Methodologies Used</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CIA Scores */}
          <Card>
            <CardHeader>
              <CardTitle>CIA Triad Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(assessmentResult.cia_scores).map(([key, value]) => {
                  const Icon = getCategoryIcon(key.charAt(0).toUpperCase() + key.slice(1));
                  return (
                    <div key={key} className={`p-4 rounded-lg ${getCategoryColor(key.charAt(0).toUpperCase() + key.slice(1))}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      </div>
                      <div className="text-2xl font-bold">{(value * 100).toFixed(0)}%</div>
                      <Progress value={value * 100} className="mt-2 h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Threats and Vulnerabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Threats Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {assessmentResult.integrated_assessment.threats_count}
                </div>
                <p className="text-sm text-gray-600">
                  Potential threats identified across all methodologies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Vulnerabilities Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {assessmentResult.integrated_assessment.vulnerabilities_count}
                </div>
                <p className="text-sm text-gray-600">
                  Security vulnerabilities requiring attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Methodology Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(assessmentResult.individual_assessments).map(([methodology, result]: [string, any]) => (
                  <div key={methodology} className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">
                      {methodology.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Risk Score:</span>
                        <span className="font-medium">{(result.risk_score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Risk Level:</span>
                        <Badge className={getRiskLevelColor(result.risk_level)}>
                          {result.risk_level}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Threats:</span>
                        <span className="font-medium">{result.threats_identified}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assessmentResult.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessmentResult.next_steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleContinueToAnalysis} className="bg-blue-600 hover:bg-blue-700">
                  Continue to Risk Analysis
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={() => setShowResults(false)}>
                  Back to Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Risk Identification" description="Identify risks using standardized methodologies">
      <div className="space-y-6">
        {/* Asset Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Asset for Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="asset-select">Choose Asset</Label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset to assess" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.length === 0 ? (
                      <SelectItem value="none" disabled>No assets available</SelectItem>
                    ) : (
                      assets.map((asset: any) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{asset.asset_type}</Badge>
                            <span>{asset.asset}</span>
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
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline">{selectedAsset.asset_type}</Badge>
                    <Badge variant="secondary">{selectedAsset.owner_department_name}</Badge>
                  </div>
                  
                  {/* Current CIA Scores */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="text-center p-2 bg-red-50 rounded">
                      <Lock className="h-4 w-4 mx-auto mb-1 text-red-600" />
                      <div className="text-sm font-medium">Confidentiality</div>
                      <div className="text-lg font-bold text-red-600">{confidentialityScore.toFixed(2)}</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <CheckCircle className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                      <div className="text-sm font-medium">Integrity</div>
                      <div className="text-lg font-bold text-blue-600">{integrityScore.toFixed(2)}</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <Shield className="h-4 w-4 mx-auto mb-1 text-green-600" />
                      <div className="text-sm font-medium">Availability</div>
                      <div className="text-lg font-bold text-green-600">{availabilityScore.toFixed(2)}</div>
                    </div>
                  </div>

                  {(confidentialityScore === 0 && integrityScore === 0 && availabilityScore === 0) && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <Info className="h-4 w-4" />
                        <span className="text-sm font-medium">CIA Assessment Required</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        This asset needs CIA assessment before risk identification. Please complete asset classification first.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => router.push(`/classification/asset-classify?id=${selectedAssetId}`)}
                      >
                        Complete Asset Classification
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Methodology Selection */}
        {selectedAssetId && methodologies && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Risk Assessment Methodologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Primary Methodology</Label>
                  <Select value={selectedMethodology} onValueChange={setSelectedMethodology}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                                          {methodologies?.available_methodologies && 
                     Object.entries(methodologies.available_methodologies).map(([key, method]) => (
                      <SelectItem key={key} value={key}>
                        {method.name}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-3 block">Include Additional Methodologies</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {methodologies?.available_methodologies && 
                     Object.entries(methodologies.available_methodologies).map(([key, method]) => (
                      <div key={key} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <input
                          type="checkbox"
                          id={key}
                          checked={selectedMethodologies.includes(key)}
                          onChange={(e) => handleMethodologyToggle(key, e.target.checked)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label htmlFor={key} className="text-sm font-medium cursor-pointer">
                            {method.name}
                          </label>
                          <p className="text-xs text-gray-600 mt-1">{method.description}</p>
                          <div className="flex gap-1 mt-2">
                            {method.compliance_frameworks?.map((framework: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {framework}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessment Action */}
        {selectedAssetId && (
          <Card>
            <CardHeader>
              <CardTitle>Perform Risk Identification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Ready to perform comprehensive risk identification using the selected methodologies and existing CIA assessment values.
                </p>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!canPerformAssessment() || identifyRiskMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {identifyRiskMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Target className="h-4 w-4 mr-2" />
                    )}
                    Identify Risks
                  </Button>
                  
                  {selectedAsset && (confidentialityScore === 0 && integrityScore === 0 && availabilityScore === 0) && (
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/classification/asset-classify?id=${selectedAssetId}`)}
                    >
                      Complete CIA Assessment First
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default RiskIdentificationPage;
