"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  useAsset,
  useAssets,
  useAssessmentQuestions,
  useIdentifyRisk,
  useClassifyAsset,
  useAnalyzeRisk,
  useCompareModels
} from "@/lib/hooks/useAssets";
import { toast } from "sonner";
import { 
  Loader2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  FileText,
  Shield,
  BarChart3,
  GitCompare,
  ArrowLeft,
  Eye,
  TrendingUp
} from "lucide-react";
import PageContainer from "@/components/common/PageContainer";

const AssetAssessmentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [responses, setResponses] = useState<{ [key: string]: number }>({});

  // Hooks
  const { data: assetsData, isLoading: assetsLoading } = useAssets();
  const { data: selectedAsset, isLoading: assetLoading } = useAsset(assetId || '');
  const { data: questions, isLoading: questionsLoading } = useAssessmentQuestions();
  const identifyRiskMutation = useIdentifyRisk();
  const classifyAssetMutation = useClassifyAsset();
  const analyzeRiskMutation = useAnalyzeRisk();
  const compareModelsMutation = useCompareModels();

  const assets = assetsData?.results || [];
  const isLoading = assetsLoading || assetLoading || questionsLoading;

  // Assessment steps
  const assessmentSteps = [
    {
      title: 'Asset Overview',
      description: 'Review asset details and information',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Classification',
      description: 'Classify the asset using fuzzy logic',
      icon: Shield,
      color: 'bg-green-500'
    },
    {
      title: 'Risk Identification',
      description: 'Assess CIA triad values',
      icon: AlertCircle,
      color: 'bg-yellow-500'
    },
    {
      title: 'Risk Analysis',
      description: 'Perform quantitative risk analysis',
      icon: BarChart3,
      color: 'bg-orange-500'
    },
    {
      title: 'Model Comparison',
      description: 'Compare traditional vs modern approaches',
      icon: GitCompare,
      color: 'bg-purple-500'
    }
  ];

  const currentStep = assessmentSteps[activeStep];

  const handleNext = async () => {
    if (activeStep < assessmentSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleClassifyAsset = async () => {
    if (!assetId) return;
    
    try {
      await classifyAssetMutation.mutateAsync(assetId);
      toast.success('Asset classified successfully');
    } catch (error) {
      toast.error('Failed to classify asset');
    }
  };

  const handleIdentifyRisk = async () => {
    if (!assetId) return;
    
    try {
      await identifyRiskMutation.mutateAsync({
        id: assetId,
        data: {
          confidentiality: Math.floor(Math.random() * 5) + 1,
          integrity: Math.floor(Math.random() * 5) + 1,
          availability: Math.floor(Math.random() * 5) + 1
        }
      });
      toast.success('Risk identified successfully');
    } catch (error) {
      toast.error('Failed to identify risk');
    }
  };

  const handleAnalyzeRisk = async () => {
    if (!assetId) return;
    
    try {
      await analyzeRiskMutation.mutateAsync(assetId);
      toast.success('Risk analyzed successfully');
    } catch (error) {
      toast.error('Failed to analyze risk');
    }
  };

  const handleCompareModels = async () => {
    if (!assetId) return;
    
    try {
      await compareModelsMutation.mutateAsync(assetId);
      toast.success('Models compared successfully');
    } catch (error) {
      toast.error('Failed to compare models');
    }
  };

  const getStepProgress = () => {
    return ((activeStep + 1) / assessmentSteps.length) * 100;
  };

  const getBadgeVariant = (value?: string) => {
    if (!value) return 'secondary';
    if (value.includes('High')) return 'destructive';
    if (value.includes('Medium')) return 'default';
    return 'secondary';
  };

  if (isLoading) {
    return (
      <PageContainer title="Asset Assessment" description="Complete asset security assessment">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!assetId) {
    return (
      <PageContainer title="Asset Assessment" description="Complete asset security assessment">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Asset Selected</h3>
              <p className="text-gray-600 mb-4">Please select an asset to begin the assessment.</p>
              <Button onClick={() => router.push('/classification/assets')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Assets
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (!selectedAsset) {
    return (
      <PageContainer title="Asset Assessment" description="Complete asset security assessment">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Asset Not Found</h3>
              <p className="text-gray-600 mb-4">The requested asset could not be found.</p>
              <Button onClick={() => router.push('/classification/assets')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Assets
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Asset Assessment" description="Complete asset security assessment">
      <div className="space-y-6">
        {/* Progress Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedAsset.asset}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{selectedAsset.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{selectedAsset.asset_type}</Badge>
                <Badge variant="secondary">{selectedAsset.owner_department_name}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Assessment Progress</span>
                <span>{activeStep + 1} of {assessmentSteps.length}</span>
              </div>
              <Progress value={getStepProgress()} className="w-full" />
              
              {/* Step Indicators */}
              <div className="flex justify-between items-center">
                {assessmentSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === activeStep;
                  const isCompleted = index < activeStep;
                  
                  return (
                    <div key={index} className="flex flex-col items-center text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm ${
                        isActive ? step.color : 
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span className="text-xs mt-2 max-w-20">{step.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(currentStep.icon, { className: "h-5 w-5" })}
              {currentStep.title}
            </CardTitle>
            <p className="text-gray-600">{currentStep.description}</p>
          </CardHeader>
          <CardContent>
            {activeStep === 0 && (
              <div className="space-y-6">
                <h3 className="font-medium">Asset Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Asset Name</label>
                    <p className="text-lg">{selectedAsset.asset}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Asset Type</label>
                    <p className="text-lg">{selectedAsset.asset_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Owner Department</label>
                    <p className="text-lg">{selectedAsset.owner_department_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Asset Value</label>
                    <p className="text-lg">{selectedAsset.asset_value_name}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-600 mt-1">{selectedAsset.description}</p>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-6">
                <h3 className="font-medium">Asset Classification</h3>
                {selectedAsset.classification ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Classification Complete</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Classification</label>
                          <Badge variant={getBadgeVariant(selectedAsset.classification)} className="ml-2">
                            {selectedAsset.classification}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Classification Value</label>
                          <span className="ml-2 font-medium">
                            {selectedAsset.classification_value?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium mb-2">Asset Not Classified</h4>
                    <p className="text-gray-600 mb-4">Click the button below to classify this asset using fuzzy logic.</p>
                    <Button 
                      onClick={handleClassifyAsset}
                      disabled={classifyAssetMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {classifyAssetMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Shield className="h-4 w-4 mr-2" />
                      )}
                      Classify Asset
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6">
                <h3 className="font-medium">Risk Identification (CIA Triad)</h3>
                {selectedAsset.risk_index ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium">Risk Identification Complete</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Confidentiality</label>
                          <div className="font-medium">{selectedAsset.confidentiality}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Integrity</label>
                          <div className="font-medium">{selectedAsset.integrity}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Availability</label>
                          <div className="font-medium">{selectedAsset.availability}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Risk Index</label>
                          <div className="font-medium">{selectedAsset.risk_index?.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium mb-2">Risk Not Identified</h4>
                    <p className="text-gray-600 mb-4">Assess the confidentiality, integrity, and availability of this asset.</p>
                    <Button 
                      onClick={handleIdentifyRisk}
                      disabled={identifyRiskMutation.isPending}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {identifyRiskMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      )}
                      Identify Risk
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-6">
                <h3 className="font-medium">Risk Analysis</h3>
                {selectedAsset.calculated_risk_level ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">Risk Analysis Complete</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Risk Level</label>
                          <div className="font-medium">{selectedAsset.calculated_risk_level?.toFixed(2)}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Harm Value</label>
                          <div className="font-medium">{selectedAsset.harm_value?.toFixed(2)}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Risk Category</label>
                          <Badge variant={getBadgeVariant(selectedAsset.mathematical_risk_category)}>
                            {selectedAsset.mathematical_risk_category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium mb-2">Risk Not Analyzed</h4>
                    <p className="text-gray-600 mb-4">Perform quantitative risk analysis on this asset.</p>
                    <Button 
                      onClick={handleAnalyzeRisk}
                      disabled={analyzeRiskMutation.isPending || !selectedAsset.risk_index}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {analyzeRiskMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <BarChart3 className="h-4 w-4 mr-2" />
                      )}
                      Analyze Risk
                    </Button>
                    {!selectedAsset.risk_index && (
                      <p className="text-sm text-gray-500 mt-2">Risk identification must be completed first</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-6">
                <h3 className="font-medium">Model Comparison</h3>
                {selectedAsset.traditional_fuzzy_prediction && selectedAsset.modern_svm_prediction && selectedAsset.modern_dt_prediction ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Model Comparison Complete</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Traditional Fuzzy Logic</label>
                          <Badge variant={getBadgeVariant(selectedAsset.traditional_fuzzy_prediction)} className="ml-2">
                            {selectedAsset.traditional_fuzzy_prediction}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Modern SVM</label>
                          <Badge variant={getBadgeVariant(selectedAsset.modern_svm_prediction)} className="ml-2">
                            {selectedAsset.modern_svm_prediction}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Modern Decision Tree</label>
                          <Badge variant={getBadgeVariant(selectedAsset.modern_dt_prediction)} className="ml-2">
                            {selectedAsset.modern_dt_prediction}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GitCompare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium mb-2">Models Not Compared</h4>
                    <p className="text-gray-600 mb-4">Compare traditional and modern machine learning approaches.</p>
                    <Button 
                      onClick={handleCompareModels}
                      disabled={compareModelsMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {compareModelsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <GitCompare className="h-4 w-4 mr-2" />
                      )}
                      Compare Models
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={activeStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/classification/assets')}
            >
              <Eye className="h-4 w-4 mr-2" />
              View All Assets
            </Button>
            
            {activeStep < assessmentSteps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => router.push(`/classification/risk-handling?id=${assetId}`)}
                className="bg-green-600 hover:bg-green-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Risk Treatment
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AssetAssessmentPage;
