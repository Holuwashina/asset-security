'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useAsset,
  useAssets,
  useAssessmentQuestions,
  Asset
} from '@/lib/hooks/useAssets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Brain, 
  Zap,
  CheckCircle,
  Loader2,
  ArrowRight,
  AlertTriangle,
  Info,
  Lock,
  Shield,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/common/PageContainer';
import { apiClient } from '@/lib/api';

interface ClassificationFormData {
  business_criticality: number;
  data_sensitivity: number;
  operational_dependency: number;
  regulatory_impact: number;
  confidentiality: number;
  integrity: number;
  availability: number;
}

interface ClassificationResult {
  classification_score: number;
  classification_category: string;
  risk_description?: string;
  impact_description?: string;
  methodology: string;
  inputs: ClassificationFormData;
  processing_details?: {
    fuzzy_output?: number;
    business_weight_contribution?: number;
    technical_weight_contribution?: number;
    data_weight_contribution?: number;
    weights_applied?: {
      fuzzy_logic?: number;
      business_factors?: number;
      technical_factors?: number;
      data_sensitivity?: number;
    };
  };
  component_scores?: {
    fuzzy_logic_output?: number;
    business_factors_score?: number;
    cia_triad_score?: number;
    data_sensitivity_score?: number;
  };
  ensemble_confidence?: number;
  individual_predictions?: any;
}

const AssetClassifyPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');

  // State
  const [selectedAssetId, setSelectedAssetId] = useState(assetId || '');
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [useEnsemble, setUseEnsemble] = useState(false);
  const [formData, setFormData] = useState<ClassificationFormData>({
    business_criticality: 0.5,
    data_sensitivity: 0.5,
    operational_dependency: 0.5,
    regulatory_impact: 0.5,
    confidentiality: 0.5,
    integrity: 0.5,
    availability: 0.5
  });

  // CIA Assessment State
  const [showCIAAssessment, setShowCIAAssessment] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState<{[key: string]: number}>({});
  const [currentCategory, setCurrentCategory] = useState('Confidentiality');

  // Hooks
  const { data: assetsData, isLoading: assetsLoading } = useAssets();
  const { data: selectedAsset, isLoading: assetLoading } = useAsset(selectedAssetId) as { data: Asset | undefined, isLoading: boolean };
  const { data: questions, isLoading: questionsLoading } = useAssessmentQuestions();

  const assets = assetsData?.results || [];
  const isLoading = assetsLoading || assetLoading || questionsLoading;

  // Filter assets that don't have classification yet
  const eligibleAssets = assets.filter((asset: any) => !asset.classification_value);

  // Group questions by category
  const questionsByCategory = questions?.reduce((acc: any, question: any) => {
    const categoryName = question.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(question);
    return acc;
  }, {}) || {};

  const categories = ['Confidentiality', 'Integrity', 'Availability'];
  const currentCategoryQuestions = questionsByCategory[currentCategory] || [];
  const currentQuestion = currentCategoryQuestions[currentQuestionIndex];

  // Calculate CIA values based on answers
  const calculateCategoryScore = (categoryName: string) => {
    const categoryQuestions = questionsByCategory[categoryName] || [];
    const categoryAnswers = categoryQuestions.map((q: any) => questionAnswers[q.id] || 0);
    
    if (categoryAnswers.length === 0) return 0;
    
    const totalScore = categoryAnswers.reduce((sum: number, answer: number) => sum + answer, 0);
    const maxPossibleScore = categoryQuestions.length * 1.0; // Max 1.0 per question
    
    return totalScore / maxPossibleScore; // Returns 0-1 scale
  };

  // Auto-populate form data when asset is selected
  useEffect(() => {
    if (selectedAsset) {
      setFormData({
        business_criticality: selectedAsset.business_criticality || 0.5,
        data_sensitivity: selectedAsset.data_sensitivity || 0.5,
        operational_dependency: selectedAsset.operational_dependency || 0.5,
        regulatory_impact: selectedAsset.regulatory_impact || 0.5,
        confidentiality: selectedAsset.confidentiality || calculateCategoryScore('Confidentiality') || 0.5,
        integrity: selectedAsset.integrity || calculateCategoryScore('Integrity') || 0.5,
        availability: selectedAsset.availability || calculateCategoryScore('Availability') || 0.5,
      });
    }
  }, [selectedAsset, questionAnswers]);

  // Update CIA scores when questions are answered
  useEffect(() => {
    if (Object.keys(questionAnswers).length > 0) {
      setFormData(prev => ({
        ...prev,
        confidentiality: calculateCategoryScore('Confidentiality'),
        integrity: calculateCategoryScore('Integrity'),
        availability: calculateCategoryScore('Availability'),
      }));
    }
  }, [questionAnswers]);

  const handleClassifyAsset = async () => {
    if (!selectedAssetId) {
      toast.error('Please select an asset');
      return;
    }

    // Validate inputs
    const inputs = Object.values(formData);
    if (inputs.some(val => val < 0 || val > 1)) {
      toast.error('All values must be between 0.0 and 1.0');
      return;
    }

    setIsClassifying(true);
    try {
      // Choose endpoint based on ensemble setting
      const endpoint = useEnsemble 
        ? `/assets/${selectedAssetId}/classify_asset_ensemble/`
        : `/assets/${selectedAssetId}/classify_asset/`;
      
      const response: any = await apiClient.post(endpoint, formData);
      
      if (response.success) {
        setClassificationResult(response.classification_result);
        const method = useEnsemble ? 'ensemble classification' : 'fuzzy logic classification';
        toast.success(`Asset classified successfully using ${method}`);
      } else {
        toast.error('Classification failed');
      }
    } catch (error: any) {
      console.error('Classification error:', error);
      toast.error(error.response?.data?.error || 'Classification failed');
    } finally {
      setIsClassifying(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 0.33) return 'text-green-600';
    if (score <= 0.66) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBadgeVariant = (score: number) => {
    if (score <= 0.33) return 'secondary';
    if (score <= 0.66) return 'default';
    return 'destructive';
  };

  // CIA Assessment Functions
  const handleAnswerQuestion = (questionId: string, answer: number) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentCategoryQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Move to next category
      const currentCategoryIndex = categories.indexOf(currentCategory);
      if (currentCategoryIndex < categories.length - 1) {
        setCurrentCategory(categories[currentCategoryIndex + 1]);
        setCurrentQuestionIndex(0);
      } else {
        // All questions completed
        setShowCIAAssessment(false);
        toast.success('CIA assessment completed successfully');
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // Move to previous category
      const currentCategoryIndex = categories.indexOf(currentCategory);
      if (currentCategoryIndex > 0) {
        const prevCategory = categories[currentCategoryIndex - 1];
        setCurrentCategory(prevCategory);
        setCurrentQuestionIndex((questionsByCategory[prevCategory] || []).length - 1);
      }
    }
  };

  const isFirstQuestion = currentCategory === 'Confidentiality' && currentQuestionIndex === 0;
  const isLastQuestion = currentCategory === 'Availability' && 
    currentQuestionIndex === (questionsByCategory['Availability'] || []).length - 1;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Confidentiality': return Lock;
      case 'Integrity': return CheckCircle;
      case 'Availability': return Shield;
      default: return HelpCircle;
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

  const getCategoryProgress = (categoryName: string) => {
    const categoryQuestions = questionsByCategory[categoryName] || [];
    const answeredInCategory = categoryQuestions.filter((q: any) => questionAnswers[q.id] !== undefined).length;
    return categoryQuestions.length > 0 ? (answeredInCategory / categoryQuestions.length) * 100 : 0;
  };

  if (isLoading) {
    return (
      <PageContainer title="Asset Classification" description="Classify assets using fuzzy logic">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Asset Classification" description="Classify assets using fuzzy logic with 0-1 scale inputs">
      <div className="space-y-6">
        
        {/* Asset Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Asset Selection for Classification
            </CardTitle>
            <CardDescription>
              Select an asset to classify using fuzzy logic methodology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="asset-select">Select Asset</Label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an asset to classify" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleAssets.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No unclassified assets found
                      </SelectItem>
                    ) : (
                      eligibleAssets.map((asset: any) => (
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
                    {selectedAsset.industry_sector && (
                      <Badge variant="outline">{selectedAsset.industry_sector}</Badge>
                    )}
                  </div>

                  {/* Auto-population indicator */}
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    <Info className="h-4 w-4" />
                    <span>Form values have been auto-populated from asset data. You can modify them below.</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Classification Form */}
        {selectedAsset && !classificationResult && !showCIAAssessment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Classification Parameters
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({
                    business_criticality: 0.5,
                    data_sensitivity: 0.5,
                    operational_dependency: 0.5,
                    regulatory_impact: 0.5,
                    confidentiality: 0.5,
                    integrity: 0.5,
                    availability: 0.5,
                  })}
                >
                  Reset to Defaults
                </Button>
              </CardTitle>
              <CardDescription>
                Rate each factor on a scale from 0.0 to 1.0. Values are auto-populated from asset data but can be modified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Asset Importance */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Asset Importance: {formData.business_criticality.toFixed(2)}
                </Label>
                <Slider
                  value={[formData.business_criticality]}
                  onValueChange={([value]) => 
                    setFormData(prev => ({...prev, business_criticality: value}))}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.0 - No business impact</span>
                  <span>0.5 - Moderate impact</span>
                  <span>1.0 - Business critical</span>
                </div>
                <p className="text-sm text-gray-600">
                  How critical is this asset to daily business operations?
                </p>
              </div>

              {/* Data Value */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Data Value: {formData.data_sensitivity.toFixed(2)}
                </Label>
                <Slider
                  value={[formData.data_sensitivity]}
                  onValueChange={([value]) => 
                    setFormData(prev => ({...prev, data_sensitivity: value}))}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.0 - Public data</span>
                  <span>0.5 - Internal data</span>
                  <span>1.0 - Highly sensitive</span>
                </div>
                <p className="text-sm text-gray-600">
                  How valuable is the data this asset handles or stores?
                </p>
              </div>

              {/* Business Criticality */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Operational Dependency: {formData.operational_dependency.toFixed(2)}
                </Label>
                <Slider
                  value={[formData.operational_dependency]}
                  onValueChange={([value]) => 
                    setFormData(prev => ({...prev, operational_dependency: value}))}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.0 - Low dependency</span>
                  <span>0.5 - Moderate dependency</span>
                  <span>1.0 - High dependency</span>
                </div>
                <p className="text-sm text-gray-600">
                  How dependent is this asset on daily business operations?
                </p>
              </div>

              {/* Replaceability */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Regulatory Impact: {formData.regulatory_impact.toFixed(2)}
                </Label>
                <Slider
                  value={[formData.regulatory_impact]}
                  onValueChange={([value]) => 
                    setFormData(prev => ({...prev, regulatory_impact: value}))}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.0 - Low regulatory impact</span>
                  <span>0.5 - Moderate regulatory impact</span>
                  <span>1.0 - High regulatory impact</span>
                </div>
                <p className="text-sm text-gray-600">
                  How significant is the regulatory impact of this asset?
                </p>
              </div>

              {/* CIA Triad Assessment */}
              <div className="space-y-6 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">CIA Triad Assessment</Label>
                  <p className="text-sm text-muted-foreground">
                    Complete a structured questionnaire to assess confidentiality, integrity, and availability requirements
                  </p>
                </div>

                {/* Current CIA Scores */}
                <div className="grid grid-cols-3 gap-4">
                  {categories.map((category) => {
                    const Icon = getCategoryIcon(category);
                    const score = calculateCategoryScore(category);
                    const progress = getCategoryProgress(category);
                    
                    return (
                      <div key={category} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`h-4 w-4 ${getCategoryColor(category).split(' ')[0]}`} />
                          <span className="text-sm font-medium">{category}</span>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {score.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {progress.toFixed(0)}% complete
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                </div>

                {/* Assessment Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowCIAAssessment(true)}
                    variant="outline"
                    size="lg"
                    className="w-full max-w-md"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    {Object.keys(questionAnswers).length > 0 ? 'Continue CIA Assessment' : 'Start CIA Assessment'}
                  </Button>
                </div>

                {Object.keys(questionAnswers).length > 0 && (
                  <div className="text-center text-sm text-muted-foreground">
                    Assessment progress will automatically update CIA scores above
                  </div>
                )}
              </div>

              {/* Classification Method Selection */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Classification Method</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="fuzzy-only"
                        name="classification-method"
                        checked={!useEnsemble}
                        onChange={() => setUseEnsemble(false)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="fuzzy-only" className="text-sm font-medium">
                        Fuzzy Logic Only
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="ensemble"
                        name="classification-method"
                        checked={useEnsemble}
                        onChange={() => setUseEnsemble(true)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="ensemble" className="text-sm font-medium">
                        Ensemble (Fuzzy + ML Models)
                      </label>
                    </div>
                  </div>
                  
                  {useEnsemble && (
                    <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Ensemble Classification</p>
                        <p>Combines fuzzy logic with trained ML models for enhanced accuracy. If no ML models are available, will fall back to fuzzy logic only.</p>
                      </div>
                    </div>
                  )}
                  
                  {!useEnsemble && (
                    <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Brain className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">Fuzzy Logic Classification</p>
                        <p>Uses rule-based fuzzy logic following NIST SP 800-60 and ISO 27005 standards.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Classification Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleClassifyAsset} 
                  className="w-full"
                  disabled={isClassifying}
                  size="lg"
                >
                  {isClassifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Classifying Asset...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      {useEnsemble ? 'Classify Asset using Ensemble' : 'Classify Asset using Fuzzy Logic'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Classification Results */}
        {classificationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Classification Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Main Result */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Classification Score</Label>
                    <div className={`text-3xl font-bold ${getScoreColor(classificationResult.classification_score)}`}>
                      {classificationResult.classification_score.toFixed(3)}
                    </div>
                  </div>
                  
                  <Badge 
                    variant={getBadgeVariant(classificationResult.classification_score)}
                    className="text-lg px-6 py-2"
                  >
                    {classificationResult.classification_category}
                  </Badge>
                  
                  <p className="text-sm text-muted-foreground">
                    {classificationResult.impact_description || classificationResult.risk_description || 'Classification completed successfully'}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Impact Level</span>
                  <span>{(classificationResult.classification_score * 100).toFixed(1)}%</span>
                </div>
                <Progress value={classificationResult.classification_score * 100} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Public (0.0)</span>
                  <span>Official (0.25)</span>
                  <span>Confidential (0.5)</span>
                  <span>Restricted (1.0)</span>
                </div>
              </div>

              {/* Input Summary */}
              {classificationResult.inputs && (
                <div>
                  <Label className="text-base font-medium mb-3 block">Security Evaluation Criteria</Label>
                  <div className="space-y-4">
                    {/* Business Parameters */}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">Business Parameters</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {classificationResult.inputs.business_criticality !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm">Business Criticality:</span>
                              <span className="font-medium">{classificationResult.inputs.business_criticality.toFixed(2)}</span>
                            </div>
                          )}
                          {classificationResult.inputs.data_sensitivity !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm">Data Sensitivity:</span>
                              <span className="font-medium">{classificationResult.inputs.data_sensitivity.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {classificationResult.inputs.operational_dependency !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm">Operational Dependency:</span>
                              <span className="font-medium">{classificationResult.inputs.operational_dependency.toFixed(2)}</span>
                            </div>
                          )}
                          {classificationResult.inputs.regulatory_impact !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm">Regulatory Impact:</span>
                              <span className="font-medium">{classificationResult.inputs.regulatory_impact.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* CIA Triad */}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">CIA Triad Assessment</Label>
                      <div className="grid grid-cols-3 gap-4">
                        {classificationResult.inputs.confidentiality !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-sm">Confidentiality:</span>
                            <span className="font-medium">{classificationResult.inputs.confidentiality.toFixed(2)}</span>
                          </div>
                        )}
                        {classificationResult.inputs.integrity !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-sm">Integrity:</span>
                            <span className="font-medium">{classificationResult.inputs.integrity.toFixed(2)}</span>
                          </div>
                        )}
                        {classificationResult.inputs.availability !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-sm">Availability:</span>
                            <span className="font-medium">{classificationResult.inputs.availability.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Details */}
              {classificationResult.processing_details && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Label className="text-base font-medium mb-3 block">Processing Details</Label>
                  <div className="space-y-2 text-sm">
                    {classificationResult.processing_details.fuzzy_output !== undefined && (
                      <div className="flex justify-between">
                        <span>Fuzzy Logic Output:</span>
                        <span className="font-medium">{classificationResult.processing_details.fuzzy_output.toFixed(3)}</span>
                      </div>
                    )}
                    {classificationResult.processing_details.business_weight_contribution !== undefined && (
                      <div className="flex justify-between">
                        <span>Business Weight Contribution:</span>
                        <span className="font-medium">{classificationResult.processing_details.business_weight_contribution.toFixed(3)}</span>
                      </div>
                    )}
                    {classificationResult.processing_details.technical_weight_contribution !== undefined && (
                      <div className="flex justify-between">
                        <span>Technical Weight Contribution:</span>
                        <span className="font-medium">{classificationResult.processing_details.technical_weight_contribution.toFixed(3)}</span>
                      </div>
                    )}
                    {classificationResult.processing_details.data_weight_contribution !== undefined && (
                      <div className="flex justify-between">
                        <span>Data Weight Contribution:</span>
                        <span className="font-medium">{classificationResult.processing_details.data_weight_contribution.toFixed(3)}</span>
                      </div>
                    )}
                    {classificationResult.ensemble_confidence !== undefined && (
                      <div className="flex justify-between">
                        <span>Ensemble Confidence:</span>
                        <span className="font-medium">{(classificationResult.ensemble_confidence * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      Methodology: {classificationResult.methodology || 'N/A'}
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => router.push(`/classification/risk-identification?id=${selectedAssetId}`)}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Proceed to Risk Identification
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CIA Assessment Modal */}
        {showCIAAssessment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  CIA Triad Assessment
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCIAAssessment(false)}
                >
                  ✕
                </Button>
              </CardTitle>
              <CardDescription>
                Answer questions to assess {currentCategory} requirements for this asset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Progress Overview */}
              <div className="grid grid-cols-3 gap-4">
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category);
                  const progress = getCategoryProgress(category);
                  const isActive = category === currentCategory;
                  
                  return (
                    <div 
                      key={category} 
                      className={`p-3 rounded-lg border ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-4 w-4 ${getCategoryColor(category).split(' ')[0]}`} />
                        <span className="text-sm font-medium">{category}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {progress.toFixed(0)}% complete
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current Question */}
              {currentQuestion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Question {currentQuestionIndex + 1} of {currentCategoryQuestions.length}
                    </CardTitle>
                    <CardDescription>
                      {currentCategory} Assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">{currentQuestion.question_text}</p>
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Rate from 0.0 (Lowest) to 1.0 (Highest)</Label>
                      <div className="flex gap-2">
                        {[0.0, 0.2, 0.4, 0.6, 0.8, 1.0].map((rating) => (
                          <Button
                            key={rating}
                            variant={questionAnswers[currentQuestion.id] === rating ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAnswerQuestion(currentQuestion.id, rating)}
                            className="flex-1"
                          >
                            {rating.toFixed(1)}
                          </Button>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.0 - None</span>
                        <span>0.5 - Moderate</span>
                        <span>1.0 - Maximum</span>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={handlePreviousQuestion}
                        disabled={isFirstQuestion}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      
                      <Button
                        onClick={handleNextQuestion}
                        disabled={questionAnswers[currentQuestion.id] === undefined}
                      >
                        {isLastQuestion ? 'Complete Assessment' : 'Next'}
                        {!isLastQuestion && <ArrowRight className="h-4 w-4 ml-2" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No Questions Available */}
              {!currentQuestion && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Questions Available</h3>
                  <p className="text-gray-600 mb-4">
                    No assessment questions found for {currentCategory}. Please add questions in the settings.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowCIAAssessment(false)}
                  >
                    Close Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Eligible Assets Message */}
        {eligibleAssets.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Assets Available for Classification</h3>
                <p className="text-gray-600 mb-4">
                  All assets have already been classified. Create new assets or review existing classifications.
                </p>
                <div className="space-x-4">
                  <Button
                    onClick={() => router.push('/classification/asset-form')}
                    variant="outline"
                  >
                    Add New Asset
                  </Button>
                  <Button
                    onClick={() => router.push('/classification/assets')}
                    variant="outline"
                  >
                    View Classified Assets
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default AssetClassifyPage;
