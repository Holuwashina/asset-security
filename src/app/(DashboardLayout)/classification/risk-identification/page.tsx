'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useAsset,
  useAssets,
  useIdentifyRisk,
  useAssessmentQuestions,
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
  ArrowLeft,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/common/PageContainer';

const RiskIdentificationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');

  // State
  const [selectedAssetId, setSelectedAssetId] = useState(assetId || '');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState<{[key: string]: number}>({});
  const [currentCategory, setCurrentCategory] = useState('Confidentiality');

  // Hooks
  const { data: assetsData, isLoading: assetsLoading } = useAssets();
  const { data: selectedAsset, isLoading: assetLoading } = useAsset(selectedAssetId) as { data: Asset | undefined, isLoading: boolean };
  const { data: questions, isLoading: questionsLoading } = useAssessmentQuestions();
  const identifyRiskMutation = useIdentifyRisk();

  const assets = assetsData?.results || [];
  const isLoading = assetsLoading || assetLoading || questionsLoading;

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
    const maxPossibleScore = categoryQuestions.length * 5; // Max 5 points per question
    
    return totalScore / maxPossibleScore; // Returns 0-1 scale
  };

  const confidentialityScore = calculateCategoryScore('Confidentiality');
  const integrityScore = calculateCategoryScore('Integrity');
  const availabilityScore = calculateCategoryScore('Availability');

  // Get current progress
  const getTotalProgress = () => {
    const totalQuestions = Object.values(questionsByCategory).flat().length;
    const answeredQuestions = Object.keys(questionAnswers).length;
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  };

  const getCategoryProgress = (categoryName: string) => {
    const categoryQuestions = questionsByCategory[categoryName] || [];
    const answeredInCategory = categoryQuestions.filter((q: any) => questionAnswers[q.id] !== undefined).length;
    return categoryQuestions.length > 0 ? (answeredInCategory / categoryQuestions.length) * 100 : 0;
  };

  const handleAnswerQuestion = (questionId: string, answer: number) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentCategoryQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Move to next category
      const currentCategoryIndex = categories.indexOf(currentCategory);
      if (currentCategoryIndex < categories.length - 1) {
        setCurrentCategory(categories[currentCategoryIndex + 1]);
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handlePrevious = () => {
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

  const allQuestionsAnswered = () => {
    const totalQuestions = Object.values(questionsByCategory).flat().length;
    const answeredQuestions = Object.keys(questionAnswers).length;
    return totalQuestions > 0 && answeredQuestions === totalQuestions;
  };

  const handleSubmit = async () => {
    if (!selectedAssetId) {
      toast.error('Please select an asset');
      return;
    }

    if (!allQuestionsAnswered()) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    try {
      await identifyRiskMutation.mutateAsync({
        id: selectedAssetId,
        data: {
          confidentiality: confidentialityScore,
          integrity: integrityScore,
          availability: availabilityScore
        }
      });
      
      toast.success('Risk identification completed successfully');
      router.push(`/classification/risk-analysis?id=${selectedAssetId}`);
    } catch (error) {
      toast.error('Failed to identify risk');
    }
  };

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

  if (isLoading) {
    return (
      <PageContainer title="Risk Identification" description="Assess CIA triad for assets">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Risk Identification" description="Assess CIA triad for assets">
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
                  <p className="text-sm text-gray-600">{selectedAsset.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{selectedAsset.asset_type}</Badge>
                    <Badge variant="secondary">{selectedAsset.owner_department_name}</Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedAssetId && questions && questions.length > 0 && (
          <>
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-gray-600">{Math.round(getTotalProgress())}%</span>
                    </div>
                    <Progress value={getTotalProgress()} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map((category) => {
                      const Icon = getCategoryIcon(category);
                      const progress = getCategoryProgress(category);
                      const score = calculateCategoryScore(category);
                      
                      return (
                        <div key={category} className={`p-3 rounded-lg ${getCategoryColor(category)}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{category}</span>
                          </div>
                          <div className="text-2xl font-bold">{(score * 100).toFixed(0)}%</div>
                          <div className="text-xs text-gray-600">{Math.round(progress)}% complete</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Question */}
            {currentQuestion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {React.createElement(getCategoryIcon(currentCategory), { className: "h-5 w-5" })}
                    {currentCategory} Assessment
                  </CardTitle>
                  <div className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {currentCategoryQuestions.length} 
                    {' '}in {currentCategory} category
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Question:</h3>
                      <p className="text-gray-800">{currentQuestion.questionText}</p>
                    </div>

                    <div className="space-y-4">
                      <Label>Rate from 1 (Very Low) to 5 (Very High):</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Button
                            key={value}
                            variant={questionAnswers[currentQuestion.id] === value ? "default" : "outline"}
                            onClick={() => handleAnswerQuestion(currentQuestion.id, value)}
                            className="flex flex-col gap-1 h-16"
                          >
                            <span className="text-lg font-bold">{value}</span>
                            <span className="text-xs">
                              {value === 1 ? 'Very Low' : 
                               value === 2 ? 'Low' : 
                               value === 3 ? 'Medium' : 
                               value === 4 ? 'High' : 'Very High'}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={isFirstQuestion}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>

                      {isLastQuestion ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!allQuestionsAnswered() || identifyRiskMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {identifyRiskMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Complete Assessment
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          disabled={questionAnswers[currentQuestion.id] === undefined}
                        >
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {selectedAssetId && questions && questions.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Questions Available</h3>
                <p className="text-gray-600 mb-4">
                  Please add assessment questions first before conducting risk identification.
                </p>
                <Button onClick={() => router.push('/settings/assessment-form')}>
                  Add Assessment Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default RiskIdentificationPage;
