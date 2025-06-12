'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  useAsset, 
  useAssets,
  useIdentifyRisk,
  useAssessmentQuestions 
} from '@/lib/hooks/useAssets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  CheckCircle,
  Loader2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/common/PageContainer';

const RiskIdentificationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');

  // State
  const [selectedAssetId, setSelectedAssetId] = useState(assetId || '');
  const [confidentiality, setConfidentiality] = useState([3]);
  const [integrity, setIntegrity] = useState([3]);
  const [availability, setAvailability] = useState([3]);
  const [currentStep, setCurrentStep] = useState(0);

  // Hooks
  const { data: assetsData, isLoading: assetsLoading } = useAssets();
  const { data: selectedAsset, isLoading: assetLoading } = useAsset(selectedAssetId);
  const { data: questions, isLoading: questionsLoading } = useAssessmentQuestions();
  const identifyRiskMutation = useIdentifyRisk();

  const assets = assetsData?.results || [];
  const isLoading = assetsLoading || assetLoading || questionsLoading;

  // CIA Assessment Steps
  const assessmentSteps = [
    {
      title: 'Confidentiality Assessment',
      description: 'Evaluate the sensitivity and confidentiality requirements',
      category: 'confidentiality',
      value: confidentiality[0],
      setValue: setConfidentiality,
      color: 'bg-blue-500',
      questions: questions?.filter((q: any) => q.category.name === 'Confidentiality') || []
    },
    {
      title: 'Integrity Assessment',
      description: 'Assess the accuracy and completeness requirements',
      category: 'integrity',
      value: integrity[0],
      setValue: setIntegrity,
      color: 'bg-green-500',
      questions: questions?.filter((q: any) => q.category.name === 'Integrity') || []
    },
    {
      title: 'Availability Assessment',
      description: 'Determine the accessibility and uptime requirements',
      category: 'availability',
      value: availability[0],
      setValue: setAvailability,
      color: 'bg-orange-500',
      questions: questions?.filter((q: any) => q.category.name === 'Availability') || []
    }
  ];

  const currentAssessment = assessmentSteps[currentStep];

  const handleSubmit = async () => {
    if (!selectedAssetId) {
      toast.error('Please select an asset');
      return;
    }

    try {
      await identifyRiskMutation.mutateAsync({
        id: selectedAssetId,
        data: {
          confidentiality: confidentiality[0],
          integrity: integrity[0],
          availability: availability[0]
        }
      });
      
      toast.success('Risk identification completed successfully');
      router.push(`/classification/risk-analysis?id=${selectedAssetId}`);
    } catch (error) {
      toast.error('Failed to identify risk');
    }
  };

  const getRiskLevel = (value: number) => {
    if (value >= 4.5) return { label: 'Very High', color: 'bg-red-600' };
    if (value >= 3.5) return { label: 'High', color: 'bg-red-500' };
    if (value >= 2.5) return { label: 'Medium', color: 'bg-yellow-500' };
    if (value >= 1.5) return { label: 'Low', color: 'bg-blue-500' };
    return { label: 'Very Low', color: 'bg-gray-500' };
  };

  const getOverallRisk = () => {
    const average = (confidentiality[0] + integrity[0] + availability[0]) / 3;
    return getRiskLevel(average);
  };

  if (isLoading) {
    return (
      <PageContainer title="Risk Identification" description="Identify and assess security risks using CIA triad">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Risk Identification" description="Identify and assess security risks using CIA triad">
      <div className="space-y-6">
        {/* Asset Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Asset Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="asset-select">Select Asset for Risk Assessment</Label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an asset to assess" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset: any) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{asset.asset_type}</Badge>
                          <span>{asset.asset}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAsset && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedAsset.asset}</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedAsset.description}</p>
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

        {selectedAssetId && (
          <>
            {/* CIA Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  CIA Triad Assessment
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {assessmentSteps.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                        index === currentStep ? step.color : 
                        index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                      </div>
                      {index < assessmentSteps.length - 1 && (
                        <div className={`w-8 h-1 ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">{currentAssessment.title}</h3>
                    <p className="text-gray-600 mb-4">{currentAssessment.description}</p>
                  </div>

                  {/* Assessment Questions */}
                  {currentAssessment.questions.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Consider these questions:</h4>
                      <ul className="space-y-2">
                        {currentAssessment.questions.map((question: any) => (
                          <li key={question.id} className="flex items-start gap-2">
                            <Eye className="h-4 w-4 mt-1 text-gray-400" />
                            <span className="text-sm">{question.questionText}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risk Level Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Risk Level: {currentAssessment.category.charAt(0).toUpperCase() + currentAssessment.category.slice(1)}</Label>
                      <Badge className={getRiskLevel(currentAssessment.value).color}>
                        {getRiskLevel(currentAssessment.value).label} ({currentAssessment.value})
                      </Badge>
                    </div>
                    
                    <Slider
                      value={[currentAssessment.value]}
                      onValueChange={currentAssessment.setValue}
                      max={5}
                      min={1}
                      step={0.1}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Very Low (1)</span>
                      <span>Low (2)</span>
                      <span>Medium (3)</span>
                      <span>High (4)</span>
                      <span>Very High (5)</span>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    {currentStep < assessmentSteps.length - 1 ? (
                      <Button
                        onClick={() => setCurrentStep(currentStep + 1)}
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={identifyRiskMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {identifyRiskMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Complete Assessment
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Confidentiality</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(confidentiality[0] / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{confidentiality[0]}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Integrity</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(integrity[0] / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{integrity[0]}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Availability</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${(availability[0] / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{availability[0]}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Overall Risk</Label>
                    <Badge className={`${getOverallRisk().color} text-white`}>
                      {getOverallRisk().label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default RiskIdentificationPage;
